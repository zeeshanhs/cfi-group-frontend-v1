#!/usr/bin/env python3
"""Check integration files, discovery routing and canonical-input presence.

Does not assert that Codex has invoked the skill or that the kit is semantically ready.
"""
from pathlib import Path
import argparse
import json
import sys
from integration import IntegrationError, audit

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--cwd', type=Path, help='Repository-relative or absolute intended Codex working directory')
    parser.add_argument('--require-kit', action='store_true', help='Fail when any canonical kit input is missing/empty')
    args = parser.parse_args()
    repo = args.repo.resolve()
    cwd = args.cwd if args.cwd is None or args.cwd.is_absolute() else repo / args.cwd
    try:
        result = audit(repo, cwd=cwd, require_kit=args.require_kit)
        print(json.dumps(result, indent=2))
        return 0 if result['installation'] == 'pass' else 1
    except (IntegrationError, OSError, UnicodeError) as exc:
        print(json.dumps({'error': str(exc)}, indent=2), file=sys.stderr)
        return 1
if __name__ == '__main__':
    raise SystemExit(main())
