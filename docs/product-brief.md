# AI Job Matcher — Product Brief

Status: Product definition. No application has been built.
Evidence: This brief contains proposed decisions and hypotheses, not validated user research.

## Problem Statement

Finding suitable Product Manager and Product Owner vacancies requires checking
multiple websites, interpreting inconsistent descriptions, and comparing each
role with a candidate’s experience and practical constraints. Language,
seniority, location and visa requirements can make otherwise relevant jobs
unsuitable. A personal tool could reduce this effort while keeping decisions
transparent and applications organised.

## Target User

A professional transitioning from technical project management and product
ownership into a formal Product Manager or Product Owner role.

Primary preferences:
- English-speaking roles in Dublin or elsewhere in Europe.
- Junior, Associate and relevant non-senior positions.
- Relocation opportunities, with visa support where needed.

Preferences are editable; missing vacancy information must remain “unknown”.

## Jobs to Be Done

- When searching across career websites, collect relevant vacancies in one place.
- When reviewing a vacancy, understand how it fits my experience and constraints.
- When deciding what to pursue, see supporting evidence and important gaps.
- When managing my search, track saved, rejected and applied roles.

## MVP Scope

A single-user web app with:

1. Profile: CV text and editable preferences for roles, seniority, language,
   location, relocation and visa support.
2. Vacancy intake:
   - Submit an individual job URL for extraction and analysis.
   - Use Playwright, where permitted, to navigate supported career pages and
     read rendered job descriptions.
   - Support two selected public career websites initially, with bounded,
     user-triggered navigation.
   - Accept pasted job text when extraction is unavailable or restricted.
   - Treat job-board APIs as optional inputs, never the sole intake method.
3. Structured vacancies: title, employer, location, source URL, description,
   seniority, language, relocation and visa information where stated.
   Retain source text, extraction time and supporting excerpts; allow corrections.
4. Relevance assessment: explain fit, gaps and unknowns against the CV and
   preferences. Use explicit filters plus bounded AI analysis; avoid presenting
   a relevance score as an objective hiring prediction.
5. Job tracking: toggle Saved independently; saved vacancies always show Applied
   or Not Applied. Marking Applied is permanent and keeps any Saved label;
   applied vacancies can be saved/unsaved but cannot be rejected. Rejecting an
   unapplied vacancy clears Saved and hides it from Active, Saved and Applied.
   Rejected vacancies allow only restoration to Active, without restoring labels.
   Dashboard Saved/Applied counts exclude rejected vacancies. Prepare canonical
   vacancy IDs, source-listing references and application-date fields for later
   duplicate detection; do not implement duplicate detection in the prototype.
   Short notes remain part of the broader MVP plan.
6. Privacy and cost controls: support deletion of CV and vacancy data, limit
   description length, cache analysis and cap AI usage.

Access policy: respect website terms and access restrictions. Do not bypass
login barriers, CAPTCHAs or technical blocks. Use conservative request limits
and provide the manual-text fallback.

Future readiness: keep source navigation, extraction, analysis and triggering
separate. This allows later AI-guided navigation and scheduled searches across
multiple career websites without requiring those capabilities at launch.

## Out of Scope

- Autonomous AI browser navigation and scheduled searches in the first release.
- Universal scraping or guaranteed compatibility with every submitted URL.
- Automatic applications, recruiter outreach or generated application documents.
- Multi-user accounts, subscriptions and mobile applications.
- Exhaustive job-market coverage or verified immigration advice.
- Training a custom model or predicting interview outcomes.

## User Stories

1. As a career-transitioning candidate, I want to enter my CV and preferences
   so that relevance assessments reflect my goals and constraints.
2. As a candidate, I want to submit a job URL or paste its description so that
   I can analyse a vacancy even when automated extraction fails.
3. As a candidate, I want to collect vacancies from supported career pages
   so that I spend less time copying job information.
4. As a candidate, I want evidence-based explanations of fit, gaps and unknowns
   so that I can decide which roles deserve attention.
5. As a candidate, I want to track saved, rejected and applied jobs with notes
   so that I avoid repeated work and maintain an organised search.

## MoSCoW Prioritization

| Priority | Capabilities |
|---|---|
| Must | CV/preferences; URL submission; permitted Playwright extraction on two supported sites; manual text fallback; structured vacancies; relevance explanations; saved/rejected/applied tracking; deletion and usage limits |
| Should | Duplicate detection; editable extracted fields; source excerpts and extraction timestamps |
| Could | CSV export; simple filters for reviewing saved vacancies |
| Won’t initially | AI-guided navigation; scheduled multi-site searches; auto-apply; multi-user features |

## Why This MVP Scope

One user, two supported websites and user-triggered extraction keep development,
maintenance and browser costs bounded. URL submission and manual text input
provide useful coverage without depending on APIs or universal extraction.
Explainable matching and job tracking test the core value: helping the candidate
make faster, better-informed decisions. Autonomous browsing and scheduling can
follow once extraction reliability and usefulness are demonstrated.

## Success Metrics

Proposed targets for a four-week personal pilot; no results are claimed:

1. Decision time: reduce median time to decide save/reject by at least 30%
   versus a manual baseline, using at least 20 vacancies in each workflow.
2. Extraction reliability: at least 90% of 30 permitted vacancy URLs across
   the two supported sites produce correct title, employer, location when
   stated, and readable description, verified against the source.
3. Assessment usefulness: at least 80% of 30 reviewed explanations are rated
   useful for a save/reject decision, with no unsupported affirmative claims
   about visa support or language requirements.

## Main Risks

- Access restrictions and page changes: review permitted sources, bound browser
  activity, maintain source-specific extraction and retain manual input.
- Incorrect AI conclusions: show source evidence, mark unknowns explicitly and
  let the user correct extracted data.
- CV privacy: minimise stored information, avoid logging CV content, support
  deletion and disclose any external AI processing.
- Cost and maintenance: limit supported sites, cache results and cap browser
  runs and AI usage.
- Unproven value: compare with the manual workflow before expanding scope.
  A single-user pilot cannot establish demand across a wider market.

## Short Roadmap

1. Define and validate: document assumptions, measure the manual baseline,
   select two permitted sources and agree on a vacancy schema.
2. Build the core loop: profile, manual intake, relevance explanations and tracking.
3. Add browser intake: submitted URLs, bounded Playwright navigation, structured
   extraction and clear fallback behaviour; run the four-week pilot.
4. Expand if evidence supports it: add sources, then trial AI-guided navigation
   and scheduled multi-site searches with access checks and usage budgets.

Portfolio record: maintain a decision log with assumptions, scope tradeoffs,
pilot method, actual results and resulting roadmap changes.
