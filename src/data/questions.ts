export type Domain =
  | "awareness"
  | "co_agency"
  | "practice"
  | "ethics"
  | "governance"
  | "reflection"

export type Question = {
  id: string
  domain: Domain
  text: string
}

export const QUESTIONS: Question[] = [
  // Awareness
  {
    id: "awareness_1",
    domain: "awareness",
    text: "People in our organisation have a shared understanding of what AI is and where it can and cannot add value."
  },
  {
    id: "awareness_2",
    domain: "awareness",
    text: "There is clarity about the limitations and risks of current AI systems."
  },
  {
    id: "awareness_3",
    domain: "awareness",
    text: "AI use is discussed in relation to organisational goals, not just tools."
  },
  {
    id: "awareness_4",
    domain: "awareness",
    text: "Staff understand the difference between experimenting with AI and embedding it into practice."
  },

  // Human–AI Co-Agency
  {
    id: "co_agency_1",
    domain: "co_agency",
    text: "Human judgement is clearly expected when using AI-generated outputs."
  },
  {
    id: "co_agency_2",
    domain: "co_agency",
    text: "Roles and responsibilities are clear when AI is used to support decisions."
  },
  {
    id: "co_agency_3",
    domain: "co_agency",
    text: "People feel confident questioning or overriding AI outputs."
  },
  {
    id: "co_agency_4",
    domain: "co_agency",
    text: "AI is framed as decision support rather than decision replacement."
  },

  // Applied Practice & Innovation
  {
    id: "practice_1",
    domain: "practice",
    text: "AI is used in specific, well-defined use cases rather than in an ad hoc way."
  },
  {
    id: "practice_2",
    domain: "practice",
    text: "AI-supported workflows are documented and shared."
  },
  {
    id: "practice_3",
    domain: "practice",
    text: "AI use is reviewed and improved based on experience."
  },
  {
    id: "practice_4",
    domain: "practice",
    text: "Innovation with AI is encouraged within clear boundaries."
  },

  // Ethics, Equity & Impact
  {
    id: "ethics_1",
    domain: "ethics",
    text: "Ethical risks (e.g. bias, exclusion) are considered before AI is used."
  },
  {
    id: "ethics_2",
    domain: "ethics",
    text: "There is transparency about when and how AI is used."
  },
  {
    id: "ethics_3",
    domain: "ethics",
    text: "The potential impact of AI on different groups is actively considered."
  },
  {
    id: "ethics_4",
    domain: "ethics",
    text: "AI use aligns with organisational values and public responsibilities."
  },

  // Decision-Making & Governance
  {
    id: "governance_1",
    domain: "governance",
    text: "There are clear guidelines for acceptable and unacceptable AI use."
  },
  {
    id: "governance_2",
    domain: "governance",
    text: "Decision ownership is clear when AI is involved."
  },
  {
    id: "governance_3",
    domain: "governance",
    text: "There are escalation routes for concerns related to AI use."
  },
  {
    id: "governance_4",
    domain: "governance",
    text: "AI-related guidance is easy for staff to find and understand."
  },

  // Reflection, Learning & Renewal
  {
    id: "reflection_1",
    domain: "reflection",
    text: "Teams regularly reflect on how AI is affecting their work."
  },
  {
    id: "reflection_2",
    domain: "reflection",
    text: "Lessons learned from AI use are shared beyond individual teams."
  },
  {
    id: "reflection_3",
    domain: "reflection",
    text: "AI practices are adapted based on feedback and evidence."
  },
  {
    id: "reflection_4",
    domain: "reflection",
    text: "AI capability development is treated as an ongoing process."
  }
]
