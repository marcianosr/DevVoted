import { beforeEach, describe, expect, it, vi } from "vitest";

import { ensureUserExists } from "~/modules/account/auth/application/userSync.service";
import * as repository from "~/modules/account/auth/infrastructure/user.repository";

vi.mock("~/modules/account/auth/infrastructure/user.repository", () => ({
	findUserById: vi.fn(),
	findUserByEmail: vi.fn(),
	insertUser: vi.fn(),
}));

vi.mock("@sentry/react", () => ({ captureException: vi.fn() }));

const BANJO = {
	id: "banjo-kazooie-123",
	email: "banjo@rareware.com",
	displayName: "Banjo Bear",
	photoUrl: "https://example.com/banjo.jpg",
};

describe("ensureUserExists", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the stored account without writing when one already exists", async () => {
		vi.mocked(repository.findUserById).mockResolvedValue(BANJO);

		expect(await ensureUserExists(BANJO)).toEqual(BANJO);
		expect(repository.insertUser).not.toHaveBeenCalled();
	});

	it("creates the account on first sight of the identity", async () => {
		vi.mocked(repository.findUserById).mockResolvedValue(undefined);
		vi.mocked(repository.insertUser).mockResolvedValue(BANJO);

		expect(await ensureUserExists(BANJO)).toEqual(BANJO);
		expect(repository.insertUser).toHaveBeenCalledWith(BANJO);
	});

	// Two sign-ins racing on the same email: the loser's insert violates the
	// unique constraint, and by then the winner has created the row it wanted.
	it("falls back to the email lookup when a concurrent insert won the race", async () => {
		vi.mocked(repository.findUserById).mockResolvedValue(undefined);
		vi.mocked(repository.insertUser).mockRejectedValue(
			new Error("duplicate key value violates unique constraint")
		);
		vi.mocked(repository.findUserByEmail).mockResolvedValue(BANJO);

		expect(await ensureUserExists(BANJO)).toEqual(BANJO);
	});

	it("rethrows when the insert failed for a reason the email lookup cannot explain", async () => {
		const outage = new Error("connection terminated");
		vi.mocked(repository.findUserById).mockResolvedValue(undefined);
		vi.mocked(repository.insertUser).mockRejectedValue(outage);
		vi.mocked(repository.findUserByEmail).mockResolvedValue(undefined);

		await expect(ensureUserExists(BANJO)).rejects.toThrow(outage);
	});
});
