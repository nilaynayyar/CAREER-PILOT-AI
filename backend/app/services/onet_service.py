"""
CareerPilot AI — O*NET Occupational Knowledge Service
======================================================
Provides access to curated O*NET occupational data stored locally as JSON.

Data source:
  O*NET OnLine (https://www.onetonline.org)
  O*NET Resource Center (https://www.onetcenter.org)
  License: CC BY 4.0

The data covers 10 occupations relevant to Indian engineering graduates.
It is intentionally curated (not exhaustive) to avoid building a large
unnecessary database infrastructure while remaining factually grounded.

Mapping logic:
  SalaryTier High  → Software-intensive / analytical roles (SOC 15-xx)
  SalaryTier Mid   → Systems / network / business analyst roles
  SalaryTier Low   → Support / operations / accounting roles (as starting points)

Note: This mapping is a HEURISTIC for the career analysis starting point.
The agentic layer may suggest any relevant occupation based on profile fit.
"""

from __future__ import annotations

import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any

from backend.app.core.config import settings
from backend.app.schemas import OnetOccupation

logger = logging.getLogger(__name__)

# Global cache
_occupations: dict[str, OnetOccupation] = {}
_loaded = False

# Domain-informed mapping from engineering specialization to relevant O*NET SOC codes
SPECIALIZATION_TO_SOC_CODES: dict[str, list[str]] = {
    "Computer Science & Engineering": [
        "15-1252.00",  # Software Developers
        "15-1251.00",  # Computer Programmers
        "15-2051.00",  # Data Scientists
        "15-1211.00",  # Computer Systems Analysts
        "15-1299.08",  # Business Intelligence Analysts
    ],
    "Computer Engineering": [
        "15-1252.00",  # Software Developers
        "17-2061.00",  # Computer Hardware Engineers
        "15-1251.00",  # Computer Programmers
        "15-1244.00",  # Network and Computer Systems Administrators
    ],
    "Information Technology": [
        "15-1252.00",  # Software Developers
        "15-1211.00",  # Computer Systems Analysts
        "15-1244.00",  # Network and Computer Systems Administrators
        "15-1231.00",  # Computer Network Support Specialists
        "15-1299.08",  # Business Intelligence Analysts
    ],
    "Electronics and Communication Engineering": [
        "17-2061.00",  # Computer Hardware Engineers
        "15-1244.00",  # Network and Computer Systems Administrators
        "15-1252.00",  # Software Developers
        "15-1211.00",  # Computer Systems Analysts
    ],
    "Electrical Engineering": [
        "17-2061.00",  # Computer Hardware Engineers
        "15-1211.00",  # Computer Systems Analysts
        "15-1252.00",  # Software Developers
    ],
    "Mechanical Engineering": [
        "15-1211.00",  # Computer Systems Analysts
        "15-1299.08",  # Business Intelligence Analysts
        "13-1161.00",  # Market Research Analysts
    ],
    "Civil Engineering": [
        "15-1211.00",  # Computer Systems Analysts
        "15-1299.08",  # Business Intelligence Analysts
        "13-1161.00",  # Market Research Analysts
    ],
}

# General fallback for any other engineering or domain
DEFAULT_SOC_CODES: list[str] = [
    "15-1252.00",  # Software Developers
    "15-1211.00",  # Computer Systems Analysts
    "15-1299.08",  # Business Intelligence Analysts
    "15-2051.00",  # Data Scientists
]

# Historical heuristic mapping (retained for backward-compatible references)
TIER_TO_SOC_CODES: dict[str, list[str]] = {
    "High": ["15-1252.00", "15-2051.00", "15-1299.08", "17-2061.00"],
    "Mid": ["15-1211.00", "15-1251.00", "15-1244.00", "13-1161.00"],
    "Low": ["15-1231.00", "13-2011.00", "15-1211.00", "15-1251.00"],
}

ONET_ATTRIBUTION = (
    "Occupational information provided by O*NET OnLine (onetonline.org), "
    "developed by the National Center for O*NET Development under the "
    "US Department of Labor. Licensed CC BY 4.0."
)


def load_onet_data() -> None:
    """Load O*NET occupations from local JSON. Called once at startup."""
    global _occupations, _loaded

    onet_path = settings.onet_dir_path / "occupations.json"
    if not onet_path.exists():
        logger.error("O*NET data file not found: %s", onet_path)
        _loaded = False
        return

    with open(onet_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for occ in data.get("occupations", []):
        occupation = OnetOccupation(**occ)
        _occupations[occupation.soc_code] = occupation

    _loaded = True
    logger.info("O*NET data loaded: %d occupations", len(_occupations))


def is_loaded() -> bool:
    return _loaded


def get_occupation(soc_code: str) -> OnetOccupation | None:
    """Retrieve an occupation by SOC code. Returns None if not found."""
    return _occupations.get(soc_code)


def get_all_occupations() -> list[OnetOccupation]:
    """Return all loaded occupations."""
    return list(_occupations.values())


def get_occupations_for_specialization(specialization: str) -> list[OnetOccupation]:
    """
    Return candidate occupations aligned with the student's specialization.
    These are starting points for exploration — not deterministic assignments.
    """
    soc_codes = SPECIALIZATION_TO_SOC_CODES.get(specialization, DEFAULT_SOC_CODES)
    results = []
    for code in soc_codes:
        occ = _occupations.get(code)
        if occ:
            results.append(occ)
    return results


def get_occupations_for_tier(salary_tier: str) -> list[OnetOccupation]:
    """
    Return candidate occupations for a given salary tier.
    Retained for backward-compatible references.
    """
    soc_codes = TIER_TO_SOC_CODES.get(salary_tier, [])
    results = []
    for code in soc_codes:
        occ = _occupations.get(code)
        if occ:
            results.append(occ)
    return results


def get_skills_for_occupation(soc_code: str) -> list[str]:
    occ = _occupations.get(soc_code)
    return occ.skills if occ else []


def get_tech_skills_for_occupation(soc_code: str) -> list[str]:
    occ = _occupations.get(soc_code)
    return occ.tech_skills if occ else []


def get_knowledge_for_occupation(soc_code: str) -> list[str]:
    occ = _occupations.get(soc_code)
    return occ.knowledge_areas if occ else []


def search_occupations(query: str) -> list[OnetOccupation]:
    """Simple title/description substring search."""
    query_lower = query.lower()
    return [
        occ for occ in _occupations.values()
        if query_lower in occ.title.lower() or query_lower in occ.description.lower()
    ]


def get_attribution() -> str:
    return ONET_ATTRIBUTION
