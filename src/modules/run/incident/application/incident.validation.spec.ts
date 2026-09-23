import { describe, expect, it } from "vitest";

import { fireAuditSchema } from "~/modules/run/incident/application/incident.validation";

describe("fireAuditSchema", () => {
	it("accepts a rival's run and a roster audit", () => {
		expect(
			fireAuditSchema.safeParse({ targetRunId: 2, auditId: "not-found" })
				.success
		).toBe(true);
	});

	it("rejects an audit the roster does not know", () => {
		expect(
			fireAuditSchema.safeParse({ targetRunId: 2, auditId: "teapot" }).success
		).toBe(false);
	});

	it("rejects a run id that cannot exist and any extra field", () => {
		expect(
			fireAuditSchema.safeParse({ targetRunId: 0, auditId: "not-found" })
				.success
		).toBe(false);
		expect(
			fireAuditSchema.safeParse({
				targetRunId: 2,
				auditId: "not-found",
				userId: "red",
			}).success
		).toBe(false);
	});
});
