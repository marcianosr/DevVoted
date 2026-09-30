import { describe, expect, it } from "vitest";

import {
	authorshipOf,
	isContributor,
	roleLabelFor,
} from "~/modules/account/profile/domain/authorship.model";

describe("roleLabelFor", () => {
	it("names a poll editor and an admin", () => {
		expect(roleLabelFor("poll-editor")).toBe("Poll editor");
		expect(roleLabelFor("admin")).toBe("Admin");
	});

	it("names no role for a plain user or a missing author", () => {
		expect(roleLabelFor("user")).toBeUndefined();
		expect(roleLabelFor(null)).toBeUndefined();
	});
});

describe("isContributor", () => {
	it("counts an author with one published poll as a contributor", () => {
		expect(isContributor({ published: 1, answers: 0 })).toBe(true);
	});

	it("does not count a player with no published poll, whatever the role", () => {
		expect(
			isContributor({ role: "Poll editor", published: 0, answers: 0 })
		).toBe(false);
	});
});

describe("authorshipOf", () => {
	it("labels the counts with the author's role", () => {
		expect(
			authorshipOf("poll-editor", { published: 12, answers: 1842 })
		).toEqual({ role: "Poll editor", published: 12, answers: 1842 });
	});

	it("leaves the role off for a plain user", () => {
		expect(authorshipOf("user", { published: 1, answers: 5 })).toEqual({
			published: 1,
			answers: 5,
		});
	});
});
