import type { Changelog, Release } from "keep-a-changelog";

export type BumpType = "minor" | "patch";

export type ReleaseDecision =
	| { kind: "nothing-to-release" }
	| { kind: "uncategorised"; description: string }
	| {
			kind: "release";
			bumpType: BumpType;
			newVersion: string;
			unreleased: string;
	  };

const CATEGORY_ORDER = [
	"added",
	"changed",
	"deprecated",
	"removed",
	"fixed",
	"security",
] as const;

type Category = (typeof CATEGORY_ORDER)[number];

const MINOR_BUMP_CATEGORIES: readonly Category[] = ["added", "removed"];

export const findUnreleased = (changelog: Changelog): Release => {
	const unreleased = changelog.findRelease();
	if (!unreleased) {
		throw new Error("No [Unreleased] section found in CHANGELOG.md");
	}
	return unreleased;
};

const changesIn = (release: Release, category: Category) =>
	release.changes.get(category) ?? [];

const hasChangesIn = (release: Release, category: Category) =>
	changesIn(release, category).length > 0;

const headingFor = (category: Category) =>
	`### ${category.charAt(0).toUpperCase()}${category.slice(1)}`;

const renderSection = (release: Release, category: Category) =>
	[
		headingFor(category),
		...changesIn(release, category).map((change) => change.toString("-")),
	].join("\n");

const renderUnreleased = (release: Release) =>
	CATEGORY_ORDER.filter((category) => hasChangesIn(release, category))
		.map((category) => renderSection(release, category))
		.join("\n\n");

const bumpTypeFor = (release: Release): BumpType =>
	MINOR_BUMP_CATEGORIES.some((category) => hasChangesIn(release, category))
		? "minor"
		: "patch";

const bumpVersion = (currentVersion: string, bumpType: BumpType) => {
	const [major, minor, patch] = currentVersion.split(".").map(Number);
	return bumpType === "minor"
		? `${major}.${minor + 1}.0`
		: `${major}.${minor}.${patch + 1}`;
};

export const decideRelease = (
	unreleased: Release,
	currentVersion: string
): ReleaseDecision => {
	if (unreleased.isEmpty()) {
		return { kind: "nothing-to-release" };
	}
	const description = unreleased.description.trim();
	if (description) {
		return { kind: "uncategorised", description };
	}
	const bumpType = bumpTypeFor(unreleased);
	return {
		kind: "release",
		bumpType,
		newVersion: bumpVersion(currentVersion, bumpType),
		unreleased: renderUnreleased(unreleased),
	};
};
