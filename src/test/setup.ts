import "@testing-library/jest-dom";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { expect, afterEach, vi } from "vitest";

expect.extend(matchers);

HTMLElement.prototype.showPopover = vi.fn();
HTMLElement.prototype.hidePopover = vi.fn();

globalThis.ResizeObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
};

afterEach(() => {
	cleanup();
});
