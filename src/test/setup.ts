import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

// Mock ResizeObserver for jsdom environment (required for recharts / responsive containers)
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = MockResizeObserver
