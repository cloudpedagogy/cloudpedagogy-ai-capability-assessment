import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { StrictMode } from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import ResultsView from "./ResultsView"
import type { AssessmentResult, AssessmentSnapshot } from "../engine/scoring"

const mockResult: AssessmentResult & {
  recommendations: {
    summaryPrimary: string
    summarySecondary: string[]
    actions: string[]
    risks: string[]
  }
} = {
  scores: {
    awareness: 75,
    co_agency: 60,
    practice: 50,
    ethics: 80,
    governance: 65,
    reflection: 70
  },
  derived: {
    domains_at_or_above_mid_count: 4
  },
  responses: {},
  metadata: {
    timestamp: "2026-04-10T12:00:00.000Z",
    role: "Senior Researcher",
    department: "Computer Science",
    context: "Annual Review"
  },
  recommendations: {
    summaryPrimary: "Solid overall AI capability with strong ethical framing.",
    summarySecondary: ["Operational practice is maturing."],
    actions: ["Standardize team workflows."],
    risks: ["Ensure non-technical staff are supported."]
  }
}

describe("ResultsView", () => {
  const STORAGE_KEY = "cp_capability_history"
  const RECOVERY_KEY_PREFIX = "cp_capability_history_corrupted"

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("renders result presentation, scores, metadata, and recommendations", () => {
    const onRestart = vi.fn()
    render(<ResultsView result={mockResult} onRestart={onRestart} />)

    expect(screen.getByText("Your Results")).toBeInTheDocument()
    expect(screen.getByText("Senior Researcher")).toBeInTheDocument()
    expect(screen.getByText("Computer Science")).toBeInTheDocument()
    expect(screen.getByText("Annual Review")).toBeInTheDocument()

    // Table rows
    expect(screen.getByText("75/100")).toBeInTheDocument()
    expect(screen.getByText("Solid overall AI capability with strong ethical framing.")).toBeInTheDocument()
    expect(screen.getByText("Standardize team workflows.")).toBeInTheDocument()
    expect(screen.getByText("Ensure non-technical staff are supported.")).toBeInTheDocument()
  })

  it("persists the assessment snapshot to localStorage under 'cp_capability_history'", () => {
    render(<ResultsView result={mockResult} onRestart={vi.fn()} />)

    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).not.toBeNull()

    const parsed: AssessmentSnapshot[] = JSON.parse(stored!)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed.length).toBe(1)
    expect(parsed[0].id).toBeDefined()
    expect(parsed[0].scores.awareness).toBe(75)
    expect(parsed[0].metadata.role).toBe("Senior Researcher")
  })

  it("caps history at 10 items (circular buffer) and prepends new snapshot", () => {
    // Populate 10 historical records
    const existingHistory: AssessmentSnapshot[] = Array.from({ length: 10 }, (_, i) => ({
      ...mockResult,
      id: `hist-${i}`,
      metadata: {
        timestamp: new Date(2026, 0, i + 1).toISOString(),
        role: `Role ${i}`
      }
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingHistory))

    render(<ResultsView result={mockResult} onRestart={vi.fn()} />)

    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed: AssessmentSnapshot[] = JSON.parse(stored!)
    expect(parsed.length).toBe(10)
    // First item is the new snapshot
    expect(parsed[0].metadata.timestamp).toBe("2026-04-10T12:00:00.000Z")
  })

  it("compares against existing previous assessment and shows delta trends", () => {
    const previousSnapshot: AssessmentSnapshot = {
      ...mockResult,
      id: "prev-1",
      scores: {
        awareness: 50, // current is 75 -> delta +25
        co_agency: 70, // current is 60 -> delta -10
        practice: 50,  // current is 50 -> delta 0
        ethics: 80,
        governance: 65,
        reflection: 70
      },
      metadata: {
        timestamp: "2026-03-01T10:00:00.000Z",
        role: "Researcher"
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([previousSnapshot]))

    render(<ResultsView result={mockResult} onRestart={vi.fn()} />)

    // Check comparison text
    expect(screen.getByText(/Comparison shown against your previous assessment/)).toBeInTheDocument()

    // Deltas
    expect(screen.getByText("+25")).toBeInTheDocument()
    expect(screen.getByText("-10")).toBeInTheDocument()
    expect(screen.getAllByText("0").length).toBeGreaterThan(0)
  })

  describe("corrupted stored data recovery", () => {
    it("does not crash on malformed JSON, backs up corrupted data, and continues", () => {
      const corruptPayload = "{malformed JSON syntax"
      localStorage.setItem(STORAGE_KEY, corruptPayload)

      expect(() => {
        render(<ResultsView result={mockResult} onRestart={vi.fn()} />)
      }).not.toThrow()

      expect(screen.getByText("Your Results")).toBeInTheDocument()

      // Corrupted payload preserved under recovery key
      const keys = Object.keys(localStorage)
      const backupKey = keys.find(k => k.startsWith(RECOVERY_KEY_PREFIX))
      expect(backupKey).toBeDefined()
      expect(localStorage.getItem(backupKey!)).toBe(corruptPayload)

      // Storage key has valid new snapshot
      const newStored = localStorage.getItem(STORAGE_KEY)
      expect(newStored).not.toBeNull()
      const parsed = JSON.parse(newStored!)
      expect(parsed[0].scores.awareness).toBe(75)
    })

    it("handles non-array stored data (e.g. object or primitive) safely", () => {
      const nonArrayPayload = JSON.stringify({ message: "not an array" })
      localStorage.setItem(STORAGE_KEY, nonArrayPayload)

      expect(() => {
        render(<ResultsView result={mockResult} onRestart={vi.fn()} />)
      }).not.toThrow()

      // Preserves payload and writes new array
      const keys = Object.keys(localStorage)
      const backupKey = keys.find(k => k.startsWith(RECOVERY_KEY_PREFIX))
      expect(backupKey).toBeDefined()
      expect(localStorage.getItem(backupKey!)).toBe(nonArrayPayload)
    })

    it("filters out partially corrupted objects in the array while preserving valid entries", () => {
      const mixedPayload = [
        { invalid: true }, // invalid snapshot missing scores and metadata
        {
          id: "valid-1",
          scores: { awareness: 60, co_agency: 60, practice: 60, ethics: 60, governance: 60, reflection: 60 },
          derived: { domains_at_or_above_mid_count: 0 },
          responses: {},
          metadata: { timestamp: "2026-01-01T00:00:00.000Z" }
        }
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mixedPayload))

      render(<ResultsView result={mockResult} onRestart={vi.fn()} />)

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      // Should contain new snapshot + the 1 valid snapshot
      expect(stored.length).toBe(2)
      expect(stored[1].id).toBe("valid-1")
    })

    it("does not destroy original corrupted payload in STORAGE_KEY if recovery backup fails", () => {
      const corruptPayload = "{corrupted data that cannot be backed up"
      localStorage.setItem(STORAGE_KEY, corruptPayload)

      // Mock setItem so that saving the recovery key throws (e.g. disk/quota error)
      const originalSetItem = Storage.prototype.setItem
      vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, val) => {
        if (key.startsWith(RECOVERY_KEY_PREFIX)) {
          throw new DOMException("Quota exceeded on backup", "QuotaExceededError")
        }
        return originalSetItem.call(localStorage, key, val)
      })

      // ResultsView must not crash and must not overwrite STORAGE_KEY
      expect(() => {
        render(<ResultsView result={mockResult} onRestart={vi.fn()} />)
      }).not.toThrow()

      // Confirm the corrupted payload remains intact in STORAGE_KEY
      expect(localStorage.getItem(STORAGE_KEY)).toBe(corruptPayload)
    })

    it("generates unique recovery keys so multiple recovery events do not overwrite previous recovery data", () => {
      const corruptPayload1 = "{corrupted payload 1"
      localStorage.setItem(STORAGE_KEY, corruptPayload1)
      const { unmount } = render(<ResultsView result={mockResult} onRestart={vi.fn()} />)
      unmount()

      const corruptPayload2 = "{corrupted payload 2"
      localStorage.setItem(STORAGE_KEY, corruptPayload2)
      render(<ResultsView result={mockResult} onRestart={vi.fn()} />)

      const recoveryKeys = Object.keys(localStorage).filter(k => k.startsWith(RECOVERY_KEY_PREFIX))
      expect(recoveryKeys.length).toBe(2)
      const recoveredValues = recoveryKeys.map(k => localStorage.getItem(k))
      expect(recoveredValues).toContain(corruptPayload1)
      expect(recoveredValues).toContain(corruptPayload2)
    })
  })

  describe("historical storage compatibility", () => {
    it("accepts valid historical snapshots where optional metadata or timestamp is missing", () => {
      const historicalMinimalSnapshot = {
        scores: {
          awareness: 50,
          co_agency: 50,
          practice: 50,
          ethics: 50,
          governance: 50,
          reflection: 50
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([historicalMinimalSnapshot]))

      expect(() => {
        render(<ResultsView result={mockResult} onRestart={vi.fn()} />)
      }).not.toThrow()

      expect(screen.getByText("Your Results")).toBeInTheDocument()
      expect(screen.getByText(/Comparison shown against your previous assessment/)).toBeInTheDocument()
    })
  })

  describe("duplicate snapshot prevention", () => {
    it("does not create duplicate snapshot under React StrictMode", () => {
      // In React StrictMode, effects run twice on mount in dev
      const freshResult = { ...mockResult, metadata: { ...mockResult.metadata, timestamp: "2026-04-10T14:00:00.000Z" } }

      render(
        <StrictMode>
          <ResultsView result={freshResult} onRestart={vi.fn()} />
        </StrictMode>
      )

      const stored: AssessmentSnapshot[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(stored.length).toBe(1)
    })

    it("does not create duplicate snapshot when component remounts with the same result", () => {
      const freshResult = { ...mockResult, metadata: { ...mockResult.metadata, timestamp: "2026-04-10T15:00:00.000Z" } }

      const { unmount } = render(<ResultsView result={freshResult} onRestart={vi.fn()} />)
      const firstStored: AssessmentSnapshot[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(firstStored.length).toBe(1)

      // Remount with the same result object
      unmount()
      render(<ResultsView result={freshResult} onRestart={vi.fn()} />)

      const secondStored: AssessmentSnapshot[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(secondStored.length).toBe(1)
    })

    it("does not create duplicate snapshot when component re-renders from state updates", () => {
      const freshResult = { ...mockResult, metadata: { ...mockResult.metadata, timestamp: "2026-04-10T16:00:00.000Z" } }
      render(<ResultsView result={freshResult} onRestart={vi.fn()} />)

      // Trigger re-renders by expanding notes and editing notes
      const notesToggle = screen.getByRole("button", { name: /Capability & Governance Notes/i })
      fireEvent.click(notesToggle)

      const capNotes = screen.getByLabelText("Capability Notes")
      fireEvent.change(capNotes, { target: { value: "Updated note text" } })

      const stored: AssessmentSnapshot[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(stored.length).toBe(1)
    })

    it("correctly saves multiple legitimate assessments even if they share identical timestamps", () => {
      const timestamp = "2026-04-10T17:00:00.000Z"
      const assessment1 = { ...mockResult, metadata: { ...mockResult.metadata, timestamp, role: "Role A" } }
      const assessment2 = { ...mockResult, metadata: { ...mockResult.metadata, timestamp, role: "Role B" } }

      const { unmount } = render(<ResultsView result={assessment1} onRestart={vi.fn()} />)
      unmount()

      render(<ResultsView result={assessment2} onRestart={vi.fn()} />)

      const stored: AssessmentSnapshot[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(stored.length).toBe(2)
      expect(stored[0].id).not.toBe(stored[1].id)
    })
  })

  describe("storage access and quota failures", () => {
    it("handles localStorage.getItem throwing SecurityError gracefully", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new DOMException("The operation is insecure.", "SecurityError")
      })

      expect(() => {
        render(<ResultsView result={mockResult} onRestart={vi.fn()} />)
      }).not.toThrow()

      expect(screen.getByText("Your Results")).toBeInTheDocument()
    })

    it("handles localStorage.setItem throwing QuotaExceededError gracefully", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("Quota exceeded", "QuotaExceededError")
      })

      expect(() => {
        render(<ResultsView result={mockResult} onRestart={vi.fn()} />)
      }).not.toThrow()

      expect(screen.getByText("Your Results")).toBeInTheDocument()
    })
  })

  describe("UI interactions and actions", () => {
    it("toggles and updates capability and governance notes", () => {
      render(<ResultsView result={mockResult} onRestart={vi.fn()} />)

      const notesToggle = screen.getByRole("button", { name: /Capability & Governance Notes/i })
      expect(screen.queryByLabelText("Capability Notes")).not.toBeInTheDocument()

      // Expand notes
      fireEvent.click(notesToggle)
      const capNotes = screen.getByLabelText("Capability Notes")
      const govNotes = screen.getByLabelText("Governance Notes")
      expect(capNotes).toBeInTheDocument()
      expect(govNotes).toBeInTheDocument()

      fireEvent.change(capNotes, { target: { value: "My capability notes" } })
      expect(capNotes).toHaveValue("My capability notes")

      fireEvent.change(govNotes, { target: { value: "My governance notes" } })
      expect(govNotes).toHaveValue("My governance notes")
    })

    it("calls onRestart when Restart assessment button is clicked", () => {
      const onRestart = vi.fn()
      render(<ResultsView result={mockResult} onRestart={onRestart} />)

      const restartBtn = screen.getByRole("button", { name: "Restart assessment" })
      fireEvent.click(restartBtn)

      expect(onRestart).toHaveBeenCalledTimes(1)
    })

    it("triggers window.print on Export as PDF", () => {
      const printSpy = vi.spyOn(window, "print").mockImplementation(() => {})
      render(<ResultsView result={mockResult} onRestart={vi.fn()} />)

      const printBtn = screen.getByRole("button", { name: "Export as PDF" })
      fireEvent.click(printBtn)

      expect(printSpy).toHaveBeenCalledTimes(1)
    })

    it("generates and triggers download for JSON and Markdown", () => {
      const createObjectURLMock = vi.fn().mockReturnValue("blob:http://localhost/mock-url")
      const revokeObjectURLMock = vi.fn()
      globalThis.URL.createObjectURL = createObjectURLMock
      globalThis.URL.revokeObjectURL = revokeObjectURLMock

      render(<ResultsView result={mockResult} onRestart={vi.fn()} />)

      const downloadJsonBtn = screen.getByRole("button", { name: "Download JSON" })
      fireEvent.click(downloadJsonBtn)
      expect(createObjectURLMock).toHaveBeenCalledTimes(1)
      expect(revokeObjectURLMock).toHaveBeenCalledTimes(1)

      const downloadMdBtn = screen.getByRole("button", { name: "Download MD" })
      fireEvent.click(downloadMdBtn)
      expect(createObjectURLMock).toHaveBeenCalledTimes(2)
      expect(revokeObjectURLMock).toHaveBeenCalledTimes(2)
    })
  })
})
