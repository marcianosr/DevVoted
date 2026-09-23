import { describe, expect, it } from "vitest";

import { CATEGORY_CODES } from "~/shared/lib/categories";

import {
	MIN_RECORD_STREAK,
	isRecordStreak,
	maintainerTitleOf,
} from "~/modules/run/run/domain/categoryRecord.model";

describe("maintainerTitleOf", () => {
	it("names the maintainer after the category as the player reads it", () => {
		expect(maintainerTitleOf("js")).toBe("JavaScript Maintainer");
	});

	it("spells out a code that is nothing like its display name", () => {
		expect(maintainerTitleOf("general-frontend")).toBe(
			"General Frontend Maintainer"
		);
	});

	it.each(CATEGORY_CODES)("titles %s without leaking its code", (code) => {
		expect(maintainerTitleOf(code)).toMatch(/ Maintainer$/);
		expect(maintainerTitleOf(code)).not.toContain("-");
	});
});

describe("isRecordStreak", () => {
	it("refuses a run one short of the floor, so no title comes cheap", () => {
		expect(isRecordStreak(MIN_RECORD_STREAK - 1)).toBe(false);
	});

	it("claims the record at the floor itself", () => {
		expect(isRecordStreak(MIN_RECORD_STREAK)).toBe(true);
	});

	it("leaves a category nobody has answered unclaimed", () => {
		expect(isRecordStreak(0)).toBe(false);
	});
});
