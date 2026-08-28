import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";

import { ConfigFacts } from "./ConfigFacts.ui";

describe("ConfigFacts", () => {
	it("states the level, the rate and the refund, in that order", () => {
		const { container } = render(
			<ConfigFacts config={CONFIGS.js} refundKb={32} />
		);

		expect(container.textContent).toBe("level 1 · ×1.25 · sells for 32 KB");
	});

	it("leaves the grade to the row's glyph", () => {
		const { container } = render(<ConfigFacts config={CONFIGS.agentsMd} />);

		expect(container.textContent).not.toMatch(/bit|crumb|nibble|byte/);
	});

	it("leaves the refund out when the caller has none to give", () => {
		const { container } = render(<ConfigFacts config={CONFIGS.js} />);

		expect(container.textContent).not.toContain("sells for");
	});

	it("leaves the level off a config that cannot be upgraded", () => {
		const { container } = render(<ConfigFacts config={CONFIGS.eslint} />);

		expect(container.textContent).not.toContain("level");
	});

	it("states the level a config has actually reached", () => {
		const { container } = render(
			<ConfigFacts config={{ ...CONFIGS.js, level: 3 }} />
		);

		expect(container.textContent).toContain("level 3");
	});

	it("closes the line with whatever the surface adds", () => {
		const { container } = render(
			<ConfigFacts config={CONFIGS.js} note="Costs 16KB — you have 8KB" />
		);

		expect(container.textContent).toContain("· Costs 16KB — you have 8KB");
	});

	it("keeps its separators out of the accessible name", () => {
		const { container } = render(<ConfigFacts config={CONFIGS.js} />);

		for (const separator of container.querySelectorAll("span[aria-hidden]"))
			expect(separator.textContent?.trim()).toBe("·");
	});
});
