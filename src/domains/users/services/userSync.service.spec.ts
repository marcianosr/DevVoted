import { describe, it, expect } from "vitest";
import type { UserSyncData } from "./userSync.service";

describe("UserSyncData interface", () => {
	it("defines the correct structure for user synchronization", () => {
		const validUserData: UserSyncData = {
			id: "banjo-kazooie-123",
			email: "banjo@rareware.com",
			displayName: "Banjo Bear",
			photoUrl: "https://example.com/banjo.jpg",
		};

		expect(validUserData.id).toBe("banjo-kazooie-123");
		expect(validUserData.email).toBe("banjo@rareware.com");
		expect(validUserData.displayName).toBe("Banjo Bear");
		expect(validUserData.photoUrl).toBe("https://example.com/banjo.jpg");
	});

	it("allows optional fields to be undefined", () => {
		const minimalUserData: UserSyncData = {
			id: "kazooie-456",
			email: "kazooie@rareware.com",
		};

		expect(minimalUserData.displayName).toBeUndefined();
		expect(minimalUserData.photoUrl).toBeUndefined();
	});

	it("handles OAuth-style data extraction", () => {
		const mockOAuthUser = {
			id: "diddy-kong",
			email: "diddy@rareware.com",
			user_metadata: {
				full_name: "Diddy Kong",
				avatar_url: "https://github.com/diddy.avatar",
			},
		};

		const extractedData: UserSyncData = {
			id: mockOAuthUser.id,
			email: mockOAuthUser.email,
			displayName: mockOAuthUser.user_metadata.full_name,
			photoUrl: mockOAuthUser.user_metadata.avatar_url,
		};

		expect(extractedData).toEqual({
			id: "diddy-kong",
			email: "diddy@rareware.com",
			displayName: "Diddy Kong",
			photoUrl: "https://github.com/diddy.avatar",
		});
	});
});