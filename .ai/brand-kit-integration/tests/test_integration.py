from __future__ import annotations
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[3]
SUPPORT = ROOT / '.ai/brand-kit-integration'
sys.path.insert(0, str(SUPPORT))
from integration import (IntegrationError, install, audit, merge_block, START, END,
                         CANONICAL, DISCOVERY, KIT_FILES, forwarder, discovery_kind, safe_path)

def snapshot(root: Path) -> dict:
    return {p.relative_to(root).as_posix(): ('link', str(p.readlink())) if p.is_symlink() else ('file', p.read_bytes())
            for p in root.rglob('*') if p.is_file() or p.is_symlink()}

class IntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='brand-integration-test-')
        self.base = Path(self.temp.name)
        self.repo = self.base/'repo'; self.repo.mkdir()
        (self.repo/'.git').mkdir()
    def tearDown(self):
        self.temp.cleanup()
    def populate_dummy_kit(self):
        for name in KIT_FILES:
            p=self.repo/'brand-kit'/name;p.parent.mkdir(parents=True,exist_ok=True)
            p.write_text('Synthetic file-presence fixture only; not a brand kit.\n')
    def install(self, **kw):
        return install(ROOT, self.repo, **kw)
    def test_default_symlink_install(self):
        self.populate_dummy_kit(); before=snapshot(self.repo/'brand-kit')
        result=self.install()
        self.assertEqual(result['discovery'],'symlink')
        self.assertTrue((self.repo/DISCOVERY).is_symlink())
        self.assertEqual((self.repo/DISCOVERY).resolve(),self.repo/CANONICAL)
        self.assertEqual(snapshot(self.repo/'brand-kit'),before)
        self.assertFalse(result['brand_kit_modified'])
    def test_forwarder_install(self):
        self.install(discovery='forwarder')
        self.assertEqual(discovery_kind(self.repo),'forwarder')
        self.assertEqual((self.repo/DISCOVERY/'SKILL.md').read_bytes(),forwarder())
        self.assertNotEqual((self.repo/DISCOVERY/'SKILL.md').read_bytes(),(self.repo/CANONICAL/'SKILL.md').read_bytes())
    def test_dry_run_writes_nothing(self):
        before=snapshot(self.repo); result=self.install(dry_run=True)
        self.assertGreater(len(result['actions']),0);self.assertEqual(snapshot(self.repo),before)
    def test_repeated_install_is_idempotent(self):
        self.install();before=snapshot(self.repo);result=self.install()
        self.assertEqual(result['actions'],[]);self.assertEqual(snapshot(self.repo),before)
    def test_forwarder_repeat_is_idempotent(self):
        self.install(discovery='forwarder');self.assertEqual(self.install(discovery='forwarder')['actions'],[])
    def test_existing_root_instructions_preserved(self):
        content=b'# Existing\r\nDo not change deployment settings.\r\n'
        (self.repo/'AGENTS.md').write_bytes(content);self.install()
        self.assertTrue((self.repo/'AGENTS.md').read_bytes().endswith(content))
    def test_active_root_override_and_base_both_routed(self):
        (self.repo/'AGENTS.md').write_text('Base text\n')
        (self.repo/'AGENTS.override.md').write_text('Override text\n')
        self.install()
        for name in ('AGENTS.md','AGENTS.override.md'):
            self.assertIn(START,(self.repo/name).read_text())
        report=audit(self.repo)
        self.assertEqual(report['active_repository_instruction_candidates'][0]['path'],'AGENTS.override.md')
    def test_empty_override_not_modified(self):
        (self.repo/'AGENTS.override.md').write_text(' \n');self.install()
        self.assertEqual((self.repo/'AGENTS.override.md').read_text(),' \n')
    def test_nested_instructions_preserved_and_reported(self):
        nested=self.repo/'src/app';nested.mkdir(parents=True)
        p=nested/'AGENTS.override.md';p.write_text('Scoped instructions\n');self.install()
        report=audit(self.repo,cwd=nested)
        self.assertEqual(p.read_text(),'Scoped instructions\n')
        self.assertIn('src/app/AGENTS.override.md',report['nested_instruction_files'])
        self.assertTrue(any('Nested active' in w for w in report['warnings']))
    def test_no_brand_kit_is_created(self):
        self.install();self.assertFalse((self.repo/'brand-kit').exists())
        r=audit(self.repo);self.assertEqual(r['installation'],'pass');self.assertEqual(r['kit_files'],'incomplete')
    def test_missing_kit_can_be_required(self):
        self.install();self.assertEqual(audit(self.repo,require_kit=True)['installation'],'fail')
    def test_nonempty_is_not_semantic_readiness(self):
        self.populate_dummy_kit();self.install();r=audit(self.repo,require_kit=True)
        self.assertEqual(r['installation'],'pass');self.assertEqual(r['kit_semantic_readiness'],'not_assessed')
        self.assertEqual(r['actual_codex_invocation'],'not_verified')
    def test_empty_kit_file_fails_presence_requirement(self):
        self.populate_dummy_kit();(self.repo/'brand-kit/design.md').write_text(' \n');self.install()
        r=audit(self.repo,require_kit=True);self.assertEqual(r['installation'],'fail')
    def test_framework_conflict_writes_nothing(self):
        p=self.repo/CANONICAL/'SKILL.md';p.parent.mkdir(parents=True);p.write_text('Existing custom skill\n')
        before=snapshot(self.repo)
        with self.assertRaisesRegex(IntegrationError,'differs'):self.install()
        self.assertEqual(snapshot(self.repo),before)
    def test_foreign_discovery_folder_not_overwritten(self):
        p=self.repo/DISCOVERY;p.mkdir(parents=True);(p/'SKILL.md').write_text('Other implementation')
        before=snapshot(self.repo)
        with self.assertRaisesRegex(IntegrationError,'Discovery'):self.install()
        self.assertEqual(snapshot(self.repo),before)
    def test_existing_legacy_skill_preserved(self):
        p=self.repo/'.agents/skills/client-experience';p.mkdir(parents=True);(p/'SKILL.md').write_text('Existing authoring skill')
        r=self.install();self.assertEqual((p/'SKILL.md').read_text(),'Existing authoring skill')
        self.assertTrue(any('client-experience' in w for w in r['warnings']))
    def test_corrupt_source_rejected_before_writing(self):
        source=self.base/'source';shutil.copytree(ROOT,source,ignore=shutil.ignore_patterns('__pycache__'))
        (source/CANONICAL/'SKILL.md').write_text('changed')
        with self.assertRaisesRegex(IntegrationError,'checksum'):install(source,self.repo)
        self.assertFalse((self.repo/'AGENTS.md').exists())
    def test_symlinked_destination_ancestor_rejected(self):
        other=self.base/'shared';other.mkdir();(self.repo/'.agent').symlink_to(other,target_is_directory=True)
        with self.assertRaisesRegex(IntegrationError,'Symlinked'):self.install()
        self.assertEqual(list(other.iterdir()),[])
    def test_symlinked_instruction_file_rejected(self):
        other=self.base/'external.md';other.write_text('Private instructions')
        (self.repo/'AGENTS.md').symlink_to(other)
        with self.assertRaisesRegex(IntegrationError,'Symlinked'):self.install()
        self.assertEqual(other.read_text(),'Private instructions')
    def test_broken_existing_link_not_repurposed(self):
        p=self.repo/DISCOVERY;p.parent.mkdir(parents=True);p.symlink_to('../../missing',target_is_directory=True)
        with self.assertRaisesRegex(IntegrationError,'broken'):self.install()
    def test_discovery_method_change_requires_explicit_reconciliation(self):
        self.install(discovery='forwarder')
        with self.assertRaisesRegex(IntegrationError,'not symlink'):self.install()
    def test_rollback_when_symlink_creation_fails(self):
        (self.repo/'AGENTS.md').write_text('Existing\n');before=snapshot(self.repo)
        with patch.object(Path,'symlink_to',side_effect=OSError('simulated unavailable symlinks')):
            with self.assertRaisesRegex(IntegrationError,'rollback'):self.install()
        self.assertEqual(snapshot(self.repo),before)
    def test_malformed_markers_rejected(self):
        (self.repo/'AGENTS.md').write_text(START+'\nUnclosed');before=snapshot(self.repo)
        with self.assertRaisesRegex(IntegrationError,'Malformed'):self.install()
        self.assertEqual(snapshot(self.repo),before)
    def test_duplicate_markers_rejected(self):
        block=(SUPPORT/'AGENTS.block.md').read_bytes()
        with self.assertRaisesRegex(IntegrationError,'duplicate'):merge_block(block+block,block)
    def test_owned_block_update_preserves_outside_text(self):
        block=(SUPPORT/'AGENTS.block.md').read_bytes();original=f'Before\n{START}\nold\n{END}\nAfter\n'.encode()
        merged=merge_block(original,block);self.assertTrue(merged.startswith(b'Before\n'))
        self.assertTrue(merged.endswith(b'\nAfter\n'));self.assertNotIn(b'\nold\n',merged)
    def test_changed_owned_profile_detected(self):
        self.install();(self.repo/CANONICAL/'references/design.md').write_text('Tampered guidance')
        self.assertEqual(audit(self.repo)['installation'],'fail')
    def test_wrong_discovery_target_detected(self):
        self.install();p=self.repo/DISCOVERY;p.unlink();p.symlink_to('../../somewhere',target_is_directory=True)
        self.assertEqual(audit(self.repo)['installation'],'fail')
    def test_forwarder_extra_body_file_detected(self):
        self.install(discovery='forwarder');(self.repo/DISCOVERY/'second-workflow.md').write_text('Unowned')
        self.assertEqual(audit(self.repo)['installation'],'fail')
    def test_package_agents_matches_block(self):
        self.assertEqual((ROOT/'AGENTS.md').read_bytes(),(SUPPORT/'AGENTS.block.md').read_bytes())
    def test_outside_working_directory_rejected(self):
        self.install()
        with self.assertRaisesRegex(IntegrationError,'inside'):audit(self.repo,cwd=self.base)
    def test_nonexistent_working_directory_rejected(self):
        self.install()
        with self.assertRaisesRegex(IntegrationError,'existing'):audit(self.repo,cwd=self.repo/'absent')
    def test_nested_duplicate_skill_warns(self):
        self.install();p=self.repo/'sub/.agents/skills/other/SKILL.md';p.parent.mkdir(parents=True);p.write_text('---\nname: brand-experience\n---\nDifferent')
        self.assertTrue(any('same skill name' in w for w in audit(self.repo)['warnings']))
    def test_custom_settings_not_claimed_audited(self):
        self.install();r=audit(self.repo)
        self.assertTrue(any('Global/user/admin' in w for w in r['warnings']))
    def test_cli_installer_and_checker(self):
        self.populate_dummy_kit()
        r=subprocess.run([sys.executable,str(ROOT/'install.py'),'--repo',str(self.repo)],capture_output=True,text=True)
        self.assertEqual(r.returncode,0,r.stderr)
        c=subprocess.run([sys.executable,str(self.repo/'.ai/brand-kit-integration/check.py'),'--repo',str(self.repo),'--require-kit'],capture_output=True,text=True)
        self.assertEqual(c.returncode,0,c.stderr);self.assertEqual(json.loads(c.stdout)['installation'],'pass')
    def test_path_traversal_rejected(self):
        for value in ('../escape','/outside','.agent/../../outside','a\\b'):
            with self.subTest(value=value):
                with self.assertRaises(IntegrationError):safe_path(self.repo,value)

if __name__=='__main__':unittest.main()
