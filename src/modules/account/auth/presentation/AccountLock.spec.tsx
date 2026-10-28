import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	AccountLock,
	COPY,
} from "~/modules/account/auth/presentation/AccountLock.ui";

describe("AccountLock", () => {
	it("names what an account buys and presses through to sign-in", async () => {
		const onSignIn = vi.fn();
		render(
			<AccountLock onSignIn={onSignIn}>
				<h1>Community</h1>
			</AccountLock>
		);

		expect(
			screen.getByRole("heading", { name: COPY.lead })
		).toBeInTheDocument();
		expect(
			screen.getAllByRole("listitem").map((item) => item.textContent)
		).toEqual([...COPY.benefits]);

		await userEvent.click(screen.getByRole("button", { name: COPY.press }));

		expect(onSignIn).toHaveBeenCalledOnce();
	});

	it("keeps the locked page out of reach of the reader and the keyboard", () => {
		render(
			<AccountLock onSignIn={() => undefined}>
				<button type="button">Loot</button>
			</AccountLock>
		);

		expect(
			screen.queryByRole("button", { name: "Loot" })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("heading", { name: "Community" })
		).not.toBeInTheDocument();
	});
});
