import "@testing-library/jest-dom/vitest";

/**
 * jsdom lacks ResizeObserver, which `useCutCornerClipPath` (every cut-corner
 * component) subscribes to. Provide a no-op so components render under test;
 * geometry itself isn't asserted here (offset sizes are 0 in jsdom).
 */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;
