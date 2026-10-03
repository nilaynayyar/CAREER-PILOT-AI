# O*NET Occupational Knowledge Base: Provenance and Curation Audit

## 1. Source and Licensing Metadata

- **Primary Source**: O*NET OnLine ([https://www.onetonline.org](https://www.onetonline.org)) / O*NET Resource Center ([https://www.onetcenter.org](https://www.onetcenter.org))
- **Publishing Authority**: National Center for O*NET Development on behalf of the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA).
- **Taxonomy Framework**: 2018 Standard Occupational Classification (SOC) / O*NET-SOC 2019 taxonomy.
- **Database Release**: O*NET 28.0 Database release.
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0).
- **Attribution Statement**:
  > "Occupational information provided by O*NET OnLine (onetonline.org), developed by the National Center for O*NET Development under the US Department of Labor. Licensed CC BY 4.0."
- **Retrieval Date**: October 2026.

---

## 2. Curated Occupations Inventory

CareerPilot AI curates a localized set of 10 engineering- and technology-relevant occupations in [`data/onet/occupations.json`](file:///c:/Users/nilay/Desktop/PROJECTS/CareerPilot-AI/data/onet/occupations.json) to eliminate cloud dependencies, prevent network latency, and avoid external API downtime.

| # | SOC Code | Official O*NET Title | Canonical Source URL | Verified Elements |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **15-1252.00** | Software Developers | [https://www.onetonline.org/link/summary/15-1252.00](https://www.onetonline.org/link/summary/15-1252.00) | Description, 10 Skills, 8 Knowledge areas, 11 Tech skills, 6 Tasks |
| 2 | **15-1251.00** | Computer Programmers | [https://www.onetonline.org/link/summary/15-1251.00](https://www.onetonline.org/link/summary/15-1251.00) | Description, 7 Skills, 5 Knowledge areas, 10 Tech skills, 5 Tasks |
| 3 | **15-1211.00** | Computer Systems Analysts | [https://www.onetonline.org/link/summary/15-1211.00](https://www.onetonline.org/link/summary/15-1211.00) | Description, 9 Skills, 7 Knowledge areas, 9 Tech skills, 5 Tasks |
| 4 | **15-2051.00** | Data Scientists | [https://www.onetonline.org/link/summary/15-2051.00](https://www.onetonline.org/link/summary/15-2051.00) | Description, 9 Skills, 6 Knowledge areas, 11 Tech skills, 6 Tasks |
| 5 | **15-1244.00** | Network and Computer Systems Administrators | [https://www.onetonline.org/link/summary/15-1244.00](https://www.onetonline.org/link/summary/15-1244.00) | Description, 9 Skills, 6 Knowledge areas, 10 Tech skills, 5 Tasks |
| 6 | **15-1231.00** | Computer Network Support Specialists | [https://www.onetonline.org/link/summary/15-1231.00](https://www.onetonline.org/link/summary/15-1231.00) | Description, 9 Skills, 5 Knowledge areas, 8 Tech skills, 5 Tasks |
| 7 | **15-1299.08** | Business Intelligence Analysts | [https://www.onetonline.org/link/summary/15-1299.08](https://www.onetonline.org/link/summary/15-1299.08) | Description, 8 Skills, 6 Knowledge areas, 9 Tech skills, 5 Tasks |
| 8 | **17-2061.00** | Computer Hardware Engineers | [https://www.onetonline.org/link/summary/17-2061.00](https://www.onetonline.org/link/summary/17-2061.00) | Description, 9 Skills, 6 Knowledge areas, 8 Tech skills, 5 Tasks |
| 9 | **13-1161.00** | Market Research Analysts and Marketing Specialists | [https://www.onetonline.org/link/summary/13-1161.00](https://www.onetonline.org/link/summary/13-1161.00) | Description, 8 Skills, 6 Knowledge areas, 8 Tech skills, 5 Tasks |
| 10 | **13-2011.00** | Accountants and Auditors | [https://www.onetonline.org/link/summary/13-2011.00](https://www.onetonline.org/link/summary/13-2011.00) | Description, 9 Skills, 6 Knowledge areas, 7 Tech skills, 5 Tasks |

---

## 3. Extracted Fields & Curation Protocol

Each occupation record strictly contains verified O*NET Content Model fields:

1. **`soc_code`**: Valid 8-character SOC 2018 identifier formatted as `XX-XXXX.XX`.
2. **`title`**: Official O*NET occupational title without abbreviations or modifications.
3. **`description`**: Exact verbatim occupational summary statement from O*NET OnLine.
4. **`skills`**: Core transferable skills from the O*NET Content Model (e.g., Programming, Systems Analysis, Critical Thinking, Complex Problem Solving).
5. **`knowledge_areas`**: Major instructional domains identified in O*NET (e.g., Computers and Electronics, Mathematics, Engineering and Technology).
6. **`tech_skills`**: Real-world software, tools, and platforms documented under O*NET "Technology Skills" and "Hot Technologies".
7. **`tasks`**: Representative generalized work activities from the O*NET task inventory.
8. **`related_soc_codes`**: Cross-referenced SOC codes categorized under "Related Occupations".

### Integrity Guarantees
- **No Embellishment**: Descriptions and skill labels are not generated or hallucinated by LLMs.
- **Deterministic Traceability**: Every skill gap identified by Agent 2 originates directly from these verified lists.
- **Attribution Compliance**: All UI views and API payloads include standard O*NET CC BY 4.0 attribution notices.
