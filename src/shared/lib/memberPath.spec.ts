import { describe, expect, it } from "vitest";

import { isMemberOnlyPath } from "~/shared/lib/memberPath";

describe("isMemberOnlyPath", () => {
	it.each(["/profile/red", "/dex", "/polls", "/polls/new", "/polls/151/edit"])(
		"keeps %s for accounts",
		(pathname) => {
			expect(isMemberOnlyPath(pathname)).toBe(true);
		}
	);

	it.each(["/run", "/run/gate", "/run/community", "/runs/151", "/profiles"])(
		"lets a guest into %s",
		(pathname) => {
			expect(isMemberOnlyPath(pathname)).toBe(false);
		}
	);
});
