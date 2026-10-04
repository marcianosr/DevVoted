import { describe, expect, it } from "vitest";

import { fireAuditSchema } from "~/modules/run/incident/application/incident.validation";

describe("fireAuditSchema", () => {
	it("accepts a rival's run, and nothing else: the server reads what you hold", () => {
		expect(fireAuditSchema.safeParse({ targetRunId: 2 }).success).toBe(true);
	});

	it("rejects a client-named audit, so no filing can be aimed off the hand", () => {
		expect(
			fireAuditSchema.safeParse({ targetRunId: 2, auditId: "not-found" })
				.success
		).toBe(false);
	});

	it("rejects a run id that cannot exist and any extra field", () => {
		expect(fireAuditSchema.safeParse({ targetRunId: 0 }).success).toBe(false);
		expect(
			fireAuditSchema.safeParse({ targetRunId: 2, userId: "red" }).success
		).toBe(false);
	});
});
