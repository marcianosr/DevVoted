import { beforeEach, describe, expect, it, vi } from "vitest";

import { ADMIN_EMAILS } from "~/shared/utils/adminAuth";
import {
	withAdminUser,
	withAuthenticatedUser,
} from "~/shared/utils/authorization";
import { reportHandledFailure } from "~/shared/utils/errorReporting";
import { getSupabaseServerClient } from "~/shared/utils/supabase";
import { GYM_LEADERS } from "~/test/kanto";

vi.mock("~/shared/utils/supabase", () => ({
	getSupabaseServerClient: vi.fn(),
}));

vi.mock("~/shared/utils/errorReporting", () => ({
	reportHandledFailure: vi.fn(),
}));

type Client = ReturnType<typeof getSupabaseServerClient>;

const isClient = (candidate: unknown): candidate is Client =>
	typeof candidate === "object" && candidate !== null && "auth" in candidate;

const clientWith = (getUser: () => Promise<unknown>): Client => {
	const client = { auth: { getUser } };
	if (!isClient(client)) throw new Error("not a client");
	return client;
};

const signedInAs = (id: string, email?: string) =>
	vi
		.mocked(getSupabaseServerClient)
		.mockReturnValue(
			clientWith(async () => ({ data: { user: { id, email } }, error: null }))
		);

const signedOut = () =>
	vi.mocked(getSupabaseServerClient).mockReturnValue(
		clientWith(async () => ({
			data: { user: null },
			error: { message: "no session" },
		}))
	);

const [brock] = GYM_LEADERS;
const [ADMIN_EMAIL] = ADMIN_EMAILS;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("withAuthenticatedUser", () => {
	it("hands the operation the session, and a plain player is no admin", async () => {
		signedInAs(brock.name, "brock@pewter.gym");

		const result = await withAuthenticatedUser(async (session) => ({
			success: true as const,
			data: session,
		}));

		expect(result).toEqual({
			success: true,
			data: { userId: brock.name, isAdmin: false },
		});
	});

	it("marks an allowlisted address as admin inside the session", async () => {
		signedInAs(brock.name, ADMIN_EMAIL);

		const result = await withAuthenticatedUser(async (session) => ({
			success: true as const,
			data: session.isAdmin,
		}));

		expect(result).toEqual({ success: true, data: true });
	});

	it("reports a signed-out request as a failed response, not a rejection", async () => {
		signedOut();
		const operation = vi.fn();

		const result = await withAuthenticatedUser(operation);

		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(operation).not.toHaveBeenCalled();
	});

	it("passes a failing operation's own error through untouched", async () => {
		signedInAs(brock.name);

		const result = await withAuthenticatedUser(async () => ({
			success: false as const,
			error: "No active run",
		}));

		expect(result).toEqual({ success: false, error: "No active run" });
		expect(reportHandledFailure).not.toHaveBeenCalled();
	});

	it("catches an operation that throws, and reports it", async () => {
		signedInAs(brock.name);
		const thrown = new Error("Run state not found");

		const result = await withAuthenticatedUser(async () => {
			throw thrown;
		});

		expect(result).toEqual({ success: false, error: "Run state not found" });
		expect(reportHandledFailure).toHaveBeenCalledWith(
			thrown,
			"withAuthenticatedUser"
		);
	});
});

describe("withAdminUser", () => {
	it("refuses a signed-in player who is not an admin before running anything", async () => {
		signedInAs(brock.name, "brock@pewter.gym");
		const operation = vi.fn();

		const result = await withAdminUser(operation);

		expect(result).toEqual({ success: false, error: "Admin access required" });
		expect(operation).not.toHaveBeenCalled();
	});

	it("runs for an allowlisted admin", async () => {
		signedInAs(brock.name, ADMIN_EMAIL);

		const result = await withAdminUser(async ({ userId }) => ({
			success: true as const,
			data: userId,
		}));

		expect(result).toEqual({ success: true, data: brock.name });
	});

	it("refuses a signed-out request the same way any session read does", async () => {
		signedOut();

		expect(await withAdminUser(vi.fn())).toEqual({
			success: false,
			error: "Not authenticated",
		});
	});
});
