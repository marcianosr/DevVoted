import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";

import { ConfigFacts } from "./ConfigFacts.ui";

describe("ConfigFacts", () => {
	it("states the grade, the level, the rate and the refund, in that order", () => {
		const { container } = render(
			<ConfigFacts config={CONFIGS.js} refundKb={16} />
		);

		expect(container.textContent).toBe(
			"common · level 1 · ×1.25 · sells for 16 KB"
		);
	});

	it("colours the grade, since the row's own stripe cannot name it", () => {
		render(<ConfigFacts config={CONFIGS.js} />);

		expect(screen.getByText("common")).toHaveClass("text-cerulean");
	});

	// A config in the opening deal has no purchase behind it, so there is no
	// refund to quote.
	it("leaves the refund out when the caller has none to give", () => {
		const { container } = render(<ConfigFacts config={CONFIGS.js} />);

		expect(container.textContent).not.toContain("sells for");
	});

	// "level 1" implies a level 2, and ESLint has no ladder at all.
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

	// Read aloud, a middot between every fact is noise.
	it("keeps its separators out of the accessible name", () => {
		const { container } = render(<ConfigFacts config={CONFIGS.js} />);

		for (const separator of container.querySelectorAll("span[aria-hidden]"))
			expect(separator.textContent?.trim()).toBe("·");
	});
});
