# Integration support

`AGENTS.block.md` owns the managed routing block; the package root `AGENTS.md` is its direct new-repository copy. The installer merges only that marked block into root instruction files. Change the block and regenerate/check both together.

`integration.py`, `check.py` and the delivery-root `install.py` use only the Python standard library. `payload-manifest.json` identifies package-owned files and hashes; it is integrity metadata, not a security signature. It excludes itself from hashing. The installer does not overwrite differing framework files; reviewed updates must reconcile them explicitly.

The checker intentionally does not parse the full CEK schema, validate visual quality or verify model tool use. It exposes those as unassessed. Existing CEK schema tools, if installed, remain separate.

Tests under `tests/` use temporary directories and dummy bytes. They test file safety/discovery wiring, not brand design or fresh Codex invocation. Run from the extracted delivery directory with:

```bash
python3 -m unittest discover -s .ai/brand-kit-integration/tests -p 'test_*.py' -v
```

The suite expects the delivery-root installer for installer CLI tests. In an installed repository, copy that installer to a temporary external package for full distribution testing, or run the unit tests from the extracted delivery. The production checker itself is installed and independently usable.
