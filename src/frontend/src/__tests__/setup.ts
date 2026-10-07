import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Generated components expose stable hooks as `data-ocid`, not `data-testid`.
configure({ testIdAttribute: "data-ocid" });

// TanStack Router restores scroll position on navigation; jsdom has no
// implementation and logs a "Not implemented" error for every route change.
window.scrollTo = vi.fn();

// jsdom does not implement matchMedia, which several UI primitives probe.
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

// Recharts' ResponsiveContainer measures its parent; jsdom reports zero size,
// so give every element a non-zero box or the charts render nothing.
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
    ResizeObserverStub;
}

// Radix UI primitives (Select, etc.) call these DOM APIs that jsdom omits.
// Without them, opening a Select throws and its options never mount.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

afterEach(() => {
  cleanup();
});
