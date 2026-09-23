import { beforeEach, describe, expect, it, vi } from "vitest";

import { ensureUserExists } from "~/modules/account/auth/application/userSync.service";
import * as repository from "~/modules/account/auth/infrastructure/user.repository";

vi.mock("~/modules/account/auth/infrastructure/user.repository", () => ({
	findUserById: vi.fn(),
	findUserByEmail: vi.fn(),
	insertUser: vi.fn(),
	touchLastSeen: vi.fn(),
}));

vi.mock("~/shared/utils/errorReporting", () => ({
	reportHandledFailure: vi.fn(),
}));

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

describe("last seen bookkeeping", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("stamps the returning account, since the auth sync is the one thing every navigation runs", async () => {
		vi.mocked(repository.findUserById).mockResolvedValue(BANJO);

		await ensureUserExists(BANJO);

		expect(repository.touchLastSeen).toHaveBeenCalledWith(BANJO.id);
	});

	it("leaves the stamp to the insert's own default on a brand new account", async () => {
		vi.mocked(repository.findUserById).mockResolvedValue(undefined);
		vi.mocked(repository.insertUser).mockResolvedValue(BANJO);

		await ensureUserExists(BANJO);

		expect(repository.touchLastSeen).not.toHaveBeenCalled();
	});

	// fetchUser turns any throw from here into a null user, which the router
	// reads as "logged out" — so a failed counter must never propagate.
	it("returns the account even when the stamp fails, rather than signing the player out", async () => {
		vi.mocked(repository.findUserById).mockResolvedValue(BANJO);
		vi.mocked(repository.touchLastSeen).mockRejectedValue(
			new Error("connection lost")
		);

		expect(await ensureUserExists(BANJO)).toEqual(BANJO);
	});
});
