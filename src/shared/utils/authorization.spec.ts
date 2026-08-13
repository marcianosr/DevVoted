import { beforeEach, describe, expect, it, vi } from "vitest";

import { withAuthenticatedUser } from "~/shared/utils/authorization";
import { getSupabaseServerClient } from "~/shared/utils/supabase";
import { GYM_LEADERS } from "~/test/kanto";

vi.mock("~/shared/utils/supabase", () => ({
	getSupabaseServerClient: vi.fn(),
}));

vi.mock("@sentry/react", () => ({ captureException: vi.fn() }));

const signedInAs = (id: string) =>
	vi.mocked(getSupabaseServerClient).mockReturnValue({
		auth: { getUser: async () => ({ data: { user: { id } }, error: null }) },
	} as unknown as ReturnType<typeof getSupabaseServerClient>);

const signedOut = () =>
	vi.mocked(getSupabaseServerClient).mockReturnValue({
		auth: {
			async getUser() {
				return { data: { user: null }, error: { message: "no session" } };
			},
		},
	} as unknown as ReturnType<typeof getSupabaseServerClient>);

const [brock] = GYM_LEADERS;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("withAuthenticatedUser", () => {
	it("hands the session's user id to the operation and returns its response", async () => {
		signedInAs(brock.name);

		const result = await withAuthenticatedUser(async (userId) => ({
			success: true as const,
			data: { sawUserId: userId },
		}));

		expect(result).toEqual({ success: true, data: { sawUserId: brock.name } });
	});

	// The whole point: without this the caller has two error modes — a rejection
	// for auth, an ApiResponse for everything else — and writes only one.
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
	});

	it("catches an operation that throws instead of resolving", async () => {
		signedInAs(brock.name);

		const result = await withAuthenticatedUser(async () => {
			throw new Error("Run state not found");
		});

		expect(result).toEqual({ success: false, error: "Run state not found" });
	});
});
