import { parser } from "keep-a-changelog";
import { describe, expect, it } from "vitest";
import { decideRelease, findUnreleased } from "./release-decision";

const CURRENT_VERSION = "1.3.0";

const changelogWith = (unreleasedBody: string) => `# Changelog

## [Unreleased]
${unreleasedBody}

## 1.3.0 - 2026-07-06
### Added
- Something that already shipped.
`;

const decide = (unreleasedBody: string) =>
	decideRelease(
		findUnreleased(parser(changelogWith(unreleasedBody))),
		CURRENT_VERSION
	);

describe("findUnreleased", () => {
	it("throws when the changelog has no Unreleased section", () => {
		const changelog = parser(
			"# Changelog\n\n## 1.3.0 - 2026-07-06\n### Added\n- Shipped.\n"
		);
		expect(() => findUnreleased(changelog)).toThrow(/Unreleased/);
	});

	it("reads the bracketless heading the release tool writes", () => {
		const markdown = changelogWith("### Fixed\n- A crash.").replace(
			"## [Unreleased]",
			"## Unreleased"
		);
		expect(
			decideRelease(findUnreleased(parser(markdown)), CURRENT_VERSION)
		).toMatchObject({ kind: "release", newVersion: "1.3.1" });
	});
});

describe("decideRelease", () => {
	it("reports nothing to release when Unreleased is empty", () => {
		expect(decide("")).toEqual({ kind: "nothing-to-release" });
	});

	it("rejects bullets outside a category heading, because the parser counts none of them", () => {
		expect(decide("- **New config.** Pays double.")).toMatchObject({
			kind: "uncategorised",
			description: expect.stringContaining("Pays double."),
		});
	});

	it("rejects a bare bullet even when categorised sections follow it", () => {
		expect(decide("- Stray note.\n\n### Added\n- A new screen.")).toMatchObject(
			{ kind: "uncategorised" }
		);
	});

	it("bumps minor when Added entries exist", () => {
		expect(decide("### Added\n- A new screen.")).toMatchObject({
			kind: "release",
			bumpType: "minor",
			newVersion: "1.4.0",
		});
	});

	it("bumps minor when only Removed entries exist", () => {
		expect(decide("### Removed\n- The on-screen timer.")).toMatchObject({
			bumpType: "minor",
			newVersion: "1.4.0",
		});
	});

	it("bumps patch when only Changed and Fixed entries exist", () => {
		expect(
			decide("### Changed\n- A quieter counter.\n\n### Fixed\n- A crash on reload.")
		).toMatchObject({ bumpType: "patch", newVersion: "1.3.1" });
	});

	it("renders the section in Keep a Changelog category order, whatever order the file uses", () => {
		expect(
			decide("### Fixed\n- A crash on reload.\n\n### Added\n- A new screen.")
		).toMatchObject({
			unreleased: "### Added\n- A new screen.\n\n### Fixed\n- A crash on reload.",
		});
	});
});
