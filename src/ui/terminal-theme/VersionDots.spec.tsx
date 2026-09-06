import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { VersionDots } from "./VersionDots.ui";

const pipsFor = (version: number, maxVersion: number) => {
	const { container } = render(
		<VersionDots version={version} maxVersion={maxVersion} />
	);
	return Array.from(container.firstElementChild?.children ?? []).map(
		(pip) => pip.className
	);
};

const filled = (pips: readonly string[]) =>
	pips.filter((pip) => pip.includes("bg-zinc-300")).length;

describe("the version dots", () => {
	it("draws one pip per version the config can reach", () => {
		expect(pipsFor(1, 5)).toHaveLength(5);
		expect(pipsFor(1, 2)).toHaveLength(2);
	});

	it("fills as many pips as the version you hold", () => {
		expect(filled(pipsFor(3, 5))).toBe(3);
		expect(filled(pipsFor(1, 5))).toBe(1);
	});

	it("leaves every pip hollow for a config never dealt", () => {
		expect(filled(pipsFor(0, 5))).toBe(0);
	});

	it("draws every pip as a circle, the ceiling included", () => {
		expect(pipsFor(3, 5).every((pip) => pip.includes("rounded-full"))).toBe(
			true
		);
	});

	it("fills the last pip only once the config is maxed", () => {
		expect(pipsFor(4, 5)[4]).not.toContain("bg-zinc-300");
		expect(pipsFor(5, 5)[4]).toContain("bg-zinc-300");
	});
});
