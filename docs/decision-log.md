# AI Job Matcher — MVP Decision Log

Based on [the product brief](product-brief.md).

Status: All decisions below are proposed for the initial release. No user
research, pilot results or implementation outcomes have validated them.
Evidence listed below is evidence to collect, not findings already obtained.

## 1. Start with a single-user product

- **Decision:** Build for one candidate before adding multi-user accounts.
- **Rationale:** Focus the low-cost MVP on CV/preferences, vacancy assessment
  and job tracking, while avoiding account management and cross-user data
  isolation work in the first release. Personal CV data still needs protection.
- **Trade-off:** A personal pilot can test usefulness for this candidate but
  cannot establish wider demand or suitability for other career profiles.
- **Assumption to validate:** One candidate can use the core workflow often
  enough to reveal whether it saves decision time and supports useful decisions.
- **Evidence that could change the decision:** Repeated needs from additional
  target users, or pilot results showing that meaningful validation requires
  comparing different profiles, could justify a small multi-user pilot.

## 2. Limit supported browsing and retain direct vacancy intake

- **Decision:** Support permitted Playwright extraction on two selected career
  websites, bounded user-triggered navigation, individual job URLs and manual
  text fallback. Do not promise universal URL compatibility or rely solely on
  job-board APIs.
- **Rationale:** A small source set makes rendered-description extraction
  testable and maintenance bounded. Submitted URLs extend user choice; pasted
  text keeps analysis available when extraction is unsupported or restricted.
- **Trade-off:** The candidate must still find some vacancies elsewhere and
  sometimes copy text. Two sites may provide insufficient relevant coverage.
- **Assumption to validate:** Two permitted sources plus direct intake provide
  enough relevant vacancies to test the matching and tracking workflow.
- **Evidence that could change the decision:** Intake logs showing frequent
  unsupported sources, excessive manual effort or poor vacancy coverage could
  justify additional sites. Expansion also requires acceptable extraction
  reliability, maintenance cost and permitted access.

## 3. Prioritise explainable relevance over a simple score

- **Decision:** Explain fit, gaps and unknowns against the CV and preferences,
  using source evidence and explicit filters. A numeric score is not the primary
  output or a prediction of hiring success.
- **Rationale:** Location, seniority, language and visa constraints require
  different judgments. A single number can hide missing information and the
  reasons a vacancy may be unsuitable.
- **Trade-off:** Explanations take more space and time to review, and AI analysis
  adds cost and can introduce unsupported conclusions.
- **Assumption to validate:** Concise, evidence-based explanations help the
  candidate make faster, better-informed save/reject decisions than a score alone.
- **Evidence that could change the decision:** Comparing decision time,
  usefulness ratings and factual errors across explanation and score-led
  presentations could support adding a compact ranking aid. It would still
  need visible reasons and unknowns, especially for visa and language claims.

## 4. Defer autonomous discovery and scheduled refresh

- **Decision:** Keep initial browsing user-triggered. Plan autonomous multi-site
  discovery, AI-guided navigation and scheduled searches or refresh for later;
  retain them as important product goals.
- **Rationale:** First establish that extraction is reliable and matching is
  useful. Unattended navigation adds variable browser/AI costs, recovery needs,
  freshness checks and recurring access-policy obligations. Keep navigation,
  extraction, analysis and triggers separate to support later expansion.
- **Trade-off:** The MVP reduces evaluation effort more than discovery effort;
  the candidate must initiate collection and may miss new or changed vacancies.
- **Assumption to validate:** User-triggered intake provides enough value for
  an initial release while reliability and cost are measured.
- **Evidence that could change the decision:** Pilot logs showing discovery or
  stale vacancies remain the main source of wasted effort could bring automation
  forward, provided permitted sources, reliable extraction and an affordable
  usage budget are demonstrated. Poor reliability would support further delay.

## Review Point

Revisit these decisions after the proposed four-week personal pilot. Use the
brief's decision-time, extraction-reliability and assessment-usefulness targets,
alongside intake effort and operating costs. Record actual results and changes
here; do not treat a single-user pilot as evidence of market-wide demand.
