import "@testing-library/jest-dom";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { expect, afterEach, vi } from "vitest";

// Extend Vitest's expect method with jest-dom matchers
expect.extend(matchers);

// jsdom does not implement the native Popover API used by src/ui/Popover.
HTMLElement.prototype.showPopover = vi.fn();
HTMLElement.prototype.hidePopover = vi.fn();

// Clean up after each test
afterEach(() => {
	cleanup();
});
