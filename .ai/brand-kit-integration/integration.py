"""Local installer/auditor for the brand consumption layer. Standard library only.

This checks files and routing, not semantic brand readiness or actual model execution.
"""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import tempfile
from typing import Any

VERSION = '1.0.0'
START = '<!-- BRAND-KIT-INTEGRATION:START -->'
END = '<!-- BRAND-KIT-INTEGRATION:END -->'
SUPPORT = '.ai/brand-kit-integration'
CANONICAL = '.agent/skills/brand-experience'
DISCOVERY = '.agents/skills/brand-experience'
LINK_TARGET = '../../.agent/skills/brand-experience'
KIT_FILES = ('kit.yaml', 'experience.md', 'design.md', 'patterns.md', 'theme.css', 'assets/index.yaml', 'evidence/index.yaml')
PROFILES = ('shared-contract.md', 'design.md', 'imagery.md', 'web-development.md', 'nextjs.md', 'review.md', 'kit-lifecycle.md')
SKIP = {'.git', 'node_modules', '.next', 'dist', 'build', '.venv', 'venv', '__pycache__', 'vendor'}

class IntegrationError(Exception):
    pass

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise IntegrationError(f'Cannot read valid JSON at {path}: {exc}') from exc

def safe_path(root: Path, rel: str, *, allow_final_symlink: bool = False) -> Path:
    """Reject traversal and symlinked destination ancestors, including in-repo ones."""
    p = PurePosixPath(rel)
    if not rel or p.is_absolute() or any(x in ('..', '.') for x in p.parts) or '\\' in rel:
        raise IntegrationError(f'Unsafe relative path: {rel}')
    dest = root.joinpath(*p.parts)
    for i in range(1, len(p.parts) + 1):
        candidate = root.joinpath(*p.parts[:i])
        if candidate.is_symlink() and not (allow_final_symlink and i == len(p.parts)):
            raise IntegrationError(f'Symlinked managed path is unsupported: {candidate}')
        if candidate.exists() and i < len(p.parts) and not candidate.is_dir():
            raise IntegrationError(f'Non-directory path ancestor: {candidate}')
    return dest

def forwarder() -> bytes:
    return ('''---
name: brand-experience
description: Apply the repository brand kit to design, imagery, frontend work, visible copy and visual reviews. This is the discovery adapter; load the canonical skill before performing the task. Not for backend-only work.
---

# Generated Codex discovery adapter

Read and apply `/.agent/skills/brand-experience/SKILL.md` from the repository root now. Its shared contract, profile routing and required brand reads govern this invocation. Read the actual canonical file; do not reconstruct it from this adapter. A leading slash is repository-relative, not an OS path. If that file is absent, report the broken installation; do not invent equivalent instructions. This adapter has no independent workflow or brand decisions.
''').encode('utf-8')

def forwarder_ui() -> bytes:
    return ('''interface:
  display_name: "Brand Experience"
  short_description: "Apply the canonical brand kit to design and web tasks"
  default_prompt: "Use $brand-experience to read the canonical repository skill and apply /brand-kit/ to this task."
policy:
  allow_implicit_invocation: true
''').encode('utf-8')

def merge_block(original: bytes | None, block: bytes) -> bytes:
    try:
        text = (original or b'').decode('utf-8')
        content = block.decode('utf-8').strip()
    except UnicodeError as exc:
        raise IntegrationError('Instruction files must use UTF-8') from exc
    if content.count(START) != 1 or content.count(END) != 1:
        raise IntegrationError('Invalid supplied routing block')
    a, b = text.count(START), text.count(END)
    if (a, b) == (0, 0):
        # Put routing early, preserve the existing content byte-for-byte after it.
        return (content + ('\n\n' + text if text else '\n')).encode('utf-8')
    if (a, b) != (1, 1) or text.index(START) > text.index(END):
        raise IntegrationError('Malformed or duplicate managed routing markers; reconcile manually')
    return (text[:text.index(START)] + content + text[text.index(END) + len(END):]).encode('utf-8')

def discovery_kind(repo: Path) -> str:
    p = repo / DISCOVERY
    if p.is_symlink():
        return 'symlink' if p.resolve() == (repo / CANONICAL).resolve() and p.is_dir() else 'broken-or-foreign-link'
    if not p.exists():
        return 'missing'
    if not p.is_dir():
        return 'conflict'
    try:
        if (p / 'SKILL.md').read_bytes() == forwarder() and (p / 'agents/openai.yaml').read_bytes() == forwarder_ui():
            allowed = {'SKILL.md', 'agents/openai.yaml'}
            actual = {f.relative_to(p).as_posix() for f in p.rglob('*') if f.is_file() or f.is_symlink()}
            if actual == allowed and all(not f.is_symlink() for f in p.rglob('*')):
                return 'forwarder'
    except OSError:
        pass
    return 'conflict'

def manifest_payload(source: Path) -> tuple[list[tuple[str, bytes]], dict]:
    location = source / SUPPORT / 'payload-manifest.json'
    manifest = load_json(location)
    if manifest.get('version') != VERSION or not isinstance(manifest.get('files'), list):
        raise IntegrationError('Unsupported integration manifest')
    seen: set[str] = set()
    payload = []
    for item in manifest['files']:
        rel = item.get('path', '')
        if rel in seen or not rel.startswith((CANONICAL + '/', SUPPORT + '/', 'docs/brand-kit-integration/')):
            raise IntegrationError(f'Invalid or duplicate payload entry: {rel}')
        seen.add(rel)
        p = safe_path(source, rel)
        try:
            data = p.read_bytes()
        except OSError as exc:
            raise IntegrationError(f'Missing payload file: {rel}') from exc
        if digest(data) != item.get('sha256'):
            raise IntegrationError(f'Package checksum mismatch: {rel}')
        payload.append((rel, data))
    required = {f'{CANONICAL}/SKILL.md', f'{CANONICAL}/agents/openai.yaml', f'{SUPPORT}/AGENTS.block.md',
                f'{SUPPORT}/check.py', f'{SUPPORT}/integration.py'} | {f'{CANONICAL}/references/{p}' for p in PROFILES}
    if not required.issubset(seen):
        raise IntegrationError('Package manifest omits required integration files')
    payload.append((f'{SUPPORT}/payload-manifest.json', location.read_bytes()))
    return payload, manifest

def make_plan(source: Path, repo: Path, discovery: str) -> tuple[list[dict], list[str]]:
    source, repo = source.resolve(), repo.resolve()
    if not repo.is_dir():
        raise IntegrationError(f'Target repository directory does not exist: {repo}')
    if source == repo:
        raise IntegrationError('Install from the extracted package into a separate repository directory')
    if discovery not in ('symlink', 'forwarder'):
        raise IntegrationError('Discovery must be symlink or forwarder')
    payload, _ = manifest_payload(source)
    block = (source / SUPPORT / 'AGENTS.block.md').read_bytes()
    plan: list[dict] = []
    for rel, data in payload:
        target = safe_path(repo, rel)
        old = target.read_bytes() if target.is_file() else None
        if target.exists() and not target.is_file():
            raise IntegrationError(f'Conflicting non-file: {rel}')
        if old is not None and old != data:
            raise IntegrationError(f'Existing framework file differs: {rel}; review the change rather than overwrite')
        if old is None:
            plan.append({'kind': 'write', 'path': rel, 'old': None, 'new': data})
    # Keep persistent routing in AGENTS.md and also in a currently active nonempty root override.
    names = ['AGENTS.md']
    override = safe_path(repo, 'AGENTS.override.md')
    if override.exists():
        if not override.is_file():
            raise IntegrationError('AGENTS.override.md is not a regular file')
        if override.read_bytes().strip():
            names.append('AGENTS.override.md')
    for name in names:
        target = safe_path(repo, name)
        if target.exists() and not target.is_file():
            raise IntegrationError(f'{name} is not a regular file')
        old = target.read_bytes() if target.exists() else None
        new = merge_block(old, block)
        if old != new:
            plan.append({'kind': 'write', 'path': name, 'old': old, 'new': new})
    safe_path(repo, DISCOVERY, allow_final_symlink=True)
    kind = discovery_kind(repo)
    if kind not in ('missing', discovery):
        raise IntegrationError(f'Discovery location is {kind}, not {discovery}: {DISCOVERY}; preserve and reconcile it explicitly')
    if kind == 'missing':
        if discovery == 'symlink':
            plan.append({'kind': 'symlink', 'path': DISCOVERY, 'target': LINK_TARGET})
        else:
            for tail, data in [('SKILL.md', forwarder()), ('agents/openai.yaml', forwarder_ui())]:
                safe_path(repo, f'{DISCOVERY}/{tail}')
                plan.append({'kind': 'write', 'path': f'{DISCOVERY}/{tail}', 'old': None, 'new': data})
    warnings = []
    if (repo / '.agents/skills/client-experience').exists() or (repo / '.agent/skills/client-experience').exists():
        warnings.append('Existing client-experience skill preserved. Use it for explicit authoring/lifecycle tasks; root brand-experience routing owns ordinary production work. Review overlapping legacy descriptions if needed.')
    if not (repo / '.git').exists():
        warnings.append('No .git entry at the target root. Start Codex here; nested-start repository-root discovery needs confirmation.')
    return plan, warnings

def apply_plan(repo: Path, plan: list[dict]) -> None:
    """Preflight all conflicts first; best-effort rollback on an I/O error.

    Run in an idle worktree. Rollback never overwrites a file changed after our write.
    """
    created_dirs: list[Path] = []
    completed: list[dict] = []
    def mkdirs(path: Path) -> None:
        missing = []
        cur = path
        while not cur.exists():
            missing.append(cur); cur = cur.parent
        for directory in reversed(missing):
            directory.mkdir(); created_dirs.append(directory)
    try:
        for item in plan:
            target = safe_path(repo, item['path'])
            mkdirs(target.parent)
            if item['kind'] == 'symlink':
                if target.exists() or target.is_symlink():
                    raise IntegrationError(f'Path appeared during install: {item["path"]}')
                target.symlink_to(item['target'], target_is_directory=True)
            else:
                current = target.read_bytes() if target.is_file() else None
                if target.is_symlink() or current != item['old'] or (target.exists() and not target.is_file()):
                    raise IntegrationError(f'File changed during install: {item["path"]}')
                if item['old'] is None:
                    with target.open('xb') as f:
                        f.write(item['new'])
                else:
                    # Use an adjacent temporary file for atomic replacement.
                    fd, temporary = tempfile.mkstemp(prefix='.brand-integration-', dir=target.parent)
                    try:
                        with os.fdopen(fd, 'wb') as f:
                            f.write(item['new'])
                        os.chmod(temporary, target.stat().st_mode & 0o777)
                        os.replace(temporary, target)
                    finally:
                        if os.path.exists(temporary):
                            os.unlink(temporary)
            completed.append(item)
    except Exception as exc:
        for item in reversed(completed):
            target = repo / item['path']
            try:
                if item['kind'] == 'symlink':
                    if target.is_symlink() and os.readlink(target) == item['target']:
                        target.unlink()
                elif target.is_file() and not target.is_symlink() and target.read_bytes() == item['new']:
                    if item['old'] is None:
                        target.unlink()
                    else:
                        target.write_bytes(item['old'])
            except OSError:
                pass
        for directory in reversed(created_dirs):
            try:
                directory.rmdir()
            except OSError:
                pass
        hint = ' Use --discovery forwarder if directory symlinks are unavailable.' if any(i['kind'] == 'symlink' for i in plan) else ''
        raise IntegrationError(f'Installation failed; attempted rollback: {exc}.{hint}') from exc

def install(source: Path, repo: Path, *, discovery: str = 'symlink', dry_run: bool = False) -> dict:
    repo = repo.resolve()
    plan, warnings = make_plan(source, repo, discovery)
    if not dry_run:
        apply_plan(repo, plan)
    return {'version': VERSION, 'repo': str(repo), 'dry_run': dry_run, 'discovery': discovery,
            'actions': [{'action': item['kind'], 'path': item['path']} for item in plan],
            'brand_kit_modified': False, 'warnings': warnings,
            'next': 'Start a fresh Codex session and run the live smoke tests; filesystem checks are not a model-execution guarantee.'}

def instruction_chain(repo: Path, cwd: Path) -> list[dict]:
    if not cwd.is_dir():
        raise IntegrationError('--cwd must be an existing directory')
    try:
        relative = cwd.resolve().relative_to(repo)
    except ValueError as exc:
        raise IntegrationError('--cwd must be inside the target repository') from exc
    result = []
    current = repo
    for part in ('', *relative.parts):
        if part:
            current /= part
        for name in ('AGENTS.override.md', 'AGENTS.md'):
            p = current / name
            if p.is_file():
                data = p.read_bytes()
                if data.strip():
                    result.append({'path': p.relative_to(repo).as_posix(), 'bytes': len(data),
                                   'has_brand_route': START.encode() in data and END.encode() in data})
                    break
    return result

def audit(repo: Path, *, cwd: Path | None = None, require_kit: bool = False) -> dict:
    repo = repo.resolve()
    if not repo.is_dir():
        raise IntegrationError('Repository directory not found')
    errors: list[str] = []
    warnings: list[str] = []
    try:
        payload, _ = manifest_payload(repo)
        # Loading already checks full package hashes for owned payload files.
        payload_count = len(payload)
    except IntegrationError as exc:
        errors.append(str(exc)); payload_count = 0
    root_agents = repo / 'AGENTS.md'
    block_path = repo / SUPPORT / 'AGENTS.block.md'
    if block_path.is_file():
        expected = block_path.read_bytes().strip()
        for p in [root_agents] + ([repo/'AGENTS.override.md'] if (repo/'AGENTS.override.md').is_file() and (repo/'AGENTS.override.md').read_bytes().strip() else []):
            if not p.is_file() or expected not in p.read_bytes():
                errors.append(f'Missing/current routing block: {p.relative_to(repo)}')
    else:
        errors.append('Missing routing block source')
    kind = discovery_kind(repo)
    if kind not in ('symlink', 'forwarder'):
        errors.append(f'Codex discovery bridge is {kind}: {DISCOVERY}')
    try:
        safe_path(repo, DISCOVERY, allow_final_symlink=True)
        safe_path(repo, CANONICAL + '/SKILL.md')
    except IntegrationError as exc:
        errors.append(str(exc))
    missing, empty = [], []
    for rel in KIT_FILES:
        try:
            p = safe_path(repo, 'brand-kit/' + rel)
            if not p.is_file():
                missing.append(rel)
            elif not p.read_bytes().strip():
                empty.append(rel)
        except IntegrationError as exc:
            errors.append(str(exc))
    if missing or empty:
        message = f'Kit input files incomplete. Missing: {missing}; empty: {empty}'
        (errors if require_kit else warnings).append(message)
    chain = instruction_chain(repo, cwd or repo)
    if not chain or not chain[0]['has_brand_route']:
        errors.append('Active root instruction file does not include brand routing')
    if any('/' in item['path'] for item in chain):
        warnings.append('Nested active instructions exist; inspect them for conflicts. Their semantics are not evaluated here.')
    if sum(item['bytes'] for item in chain) > 32768:
        warnings.append('Repository instruction chain exceeds the documented default 32 KiB budget; actual configured/global limits were not inspected.')
    nested = []
    duplicates = []
    for base, dirs, files in os.walk(repo, followlinks=False):
        dirs[:] = [d for d in dirs if d not in SKIP and not (Path(base)/d).is_symlink()]
        relbase = Path(base).relative_to(repo)
        if relbase.parts:
            for name in ('AGENTS.md', 'AGENTS.override.md'):
                if name in files:
                    nested.append((relbase/name).as_posix())
        if 'SKILL.md' in files and '.agents' in relbase.parts and (relbase/'SKILL.md').as_posix() != DISCOVERY + '/SKILL.md':
            try:
                txt = (Path(base)/'SKILL.md').read_text(encoding='utf-8')
                import re
                if re.search(r'^name:\s*[\'\"]?brand-experience[\'\"]?\s*$', txt, re.M):
                    duplicates.append((relbase/'SKILL.md').as_posix())
            except (OSError, UnicodeError):
                pass
    if duplicates:
        warnings.append('Other repository discovery entries use the same skill name: ' + ', '.join(duplicates))
    warnings.append('Global/user/admin instructions, custom fallback filenames, skill-disable settings, host tools and actual model invocation are not verified by this repository-only audit.')
    return {'version': VERSION, 'repo': str(repo), 'installation': 'pass' if not errors else 'fail',
            'owned_payload_files_checked': payload_count, 'discovery': kind,
            'kit_files': 'present-and-nonempty' if not missing and not empty else 'incomplete',
            'kit_semantic_readiness': 'not_assessed', 'actual_codex_invocation': 'not_verified',
            'active_repository_instruction_candidates': chain, 'nested_instruction_files': sorted(nested),
            'errors': errors, 'warnings': warnings}
