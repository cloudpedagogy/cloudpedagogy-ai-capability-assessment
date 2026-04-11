# PROJECT_SPEC: cloudpedagogy-ai-capability-assessment

## 1. Repo Name
`cloudpedagogy-ai-capability-assessment`

## 2. One-Sentence Purpose
A static, lightweight tool for conducting individual or team self-assessments against the 6 CloudPedagogy capability domains.

## 3. Problem the App Solves
Lack of a simple, non-tracked way for users to self-assess their AI readiness and capability gaps without complex institutional infrastructure or privacy concerns.

## 4. Primary User / Audience
Individual learners, educators, and organisational teams.

## 5. Core Role in the CloudPedagogy Ecosystem
The primary data collection point for individual capability states; results serve as the source material for aggregated institutional views in the Dashboard.

## 6. Main Entities / Data Structures
- **Domain**: One of 6 standard domains (Awareness, Co-agency, Practice, Ethics, Governance, Renewal).
- **Question**: Hardcoded assessment items mapped to specific domains.
- **AssessmentState**: Transient mapping of questions to user-selected scores/bands.

## 7. Main User Workflows
1. **Self-Assessment**: Step through structured questions covering the 6 domains.
2. **Review Results**: View immediate scoring and band assignment (Emerging to Embedded).
3. **Data Export**: Generate raw result data for aggregation or personal records.

## 8. Current Features
- 6-domain capability coverage.
- Static, hardcoded question set for consistency.
- Scoring logic mapped to established capability bands.
- Clean, distraction-free assessment UI.

## 9. Stubbed / Partial / Incomplete Features
- Appears functional and stable as a standalone utility.

## 10. Import / Export and Storage Model
- **Storage**: Primarily transient/in-memory (privacy-first).
- **Export**: Generates raw score data for inclusion in Dashboard datasets.

## 11. Relationship to Other CloudPedagogy Apps
Directly provides the source data consumed by the `ai-capability-dashboard`.

## 12. Potential Overlap or Duplication Risks
Very low; highly specialized as a data-collection front-end.

## 13. Distinctive Value of This App
Extreme simplicity and privacy; it allows for honest self-reflection without institutional data-recording by default.

## 14. Recommended Future Enhancements
(Inferred) Support for longitudinal "Snapshot" exports to track personal growth over time; optional local-only progress saving.

## 15. Anything Unclear or Inferred from Repo Contents
Statelessness is inferred as a design choice to maximize user trust and privacy.
