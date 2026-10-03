#!/usr/bin/env python3
"""Environment and Project Foundation Verification Script for CareerPilot AI.

Verifies that the required Phase 1 directory structures, configuration templates,
and inspection tools are properly initialized.
"""

from __future__ import annotations

import sys
from pathlib import Path

REQUIRED_FILES = [
    ".gitignore",
    ".env.example",
    "README.md",
    "ml/requirements.txt",
    "backend/requirements.txt",
    "scripts/inspect_dataset.py",
    "data/docs/DATASET_GUIDELINES.md",
    "ml/src/__init__.py",
    "ml/tests/__init__.py",
    "backend/app/__init__.py",
    "backend/app/api/__init__.py",
    "backend/app/core/__init__.py",
    "backend/app/schemas/__init__.py",
    "backend/app/services/__init__.py",
    "backend/tests/__init__.py",
    "scripts/__init__.py",
]

REQUIRED_DIRS = [
    "data/raw",
    "data/processed",
    "data/docs",
    "ml/configs",
    "ml/notebooks",
    "ml/src",
    "ml/tests",
    "ml/models",
    "backend/app",
    "backend/tests",
    "agents",
    "scripts",
    "docs",
]


def check_python_version() -> bool:
    print("Checking Python environment...")
    v = sys.version_info
    print(f"  Detected Python: {v.major}.{v.minor}.{v.micro}")
    if v.major < 3 or (v.major == 3 and v.minor < 10):
        print("  [!] WARNING: Python 3.10+ is recommended.")
        return False
    print("  [OK] Python version supported.")
    return True


def check_structure(root_dir: Path) -> bool:
    print("\nChecking directory structure...")
    all_ok = True
    for d in REQUIRED_DIRS:
        dp = root_dir / d
        if not dp.is_dir():
            print(f"  [X] Missing directory: {d}")
            all_ok = False
        else:
            print(f"  [OK] Directory exists: {d}")

    print("\nChecking required foundation files...")
    for f in REQUIRED_FILES:
        fp = root_dir / f
        if not fp.is_file():
            print(f"  [X] Missing file: {f}")
            all_ok = False
        else:
            print(f"  [OK] File exists: {f}")

    return all_ok


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    print("=" * 60)
    print("      CAREERPILOT AI - PHASE 1 FOUNDATION CHECK")
    print("=" * 60)
    py_ok = check_python_version()
    struct_ok = check_structure(root)

    print("\n" + "=" * 60)
    if py_ok and struct_ok:
        print("[SUCCESS] All Phase 1 foundation checks passed.")
        print("Ready for candidate dataset discovery & inspection.")
        print("=" * 60)
        return 0
    else:
        print("[FAILURE] Some foundation checks failed.")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(main())
