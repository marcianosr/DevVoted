import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	COPY,
	SignUpOffer,
} from "~/modules/account/auth/presentation/SignUpOffer.ui";

describe("SignUpOffer", () => {
	it("offers to keep the run and presses through to sign-up", async () => {
		const onSignUp = vi.fn();
		render(<SignUpOffer onSignUp={onSignUp} />);

		expect(
			screen.getByRole("heading", { name: COPY.lead })
		).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: COPY.press }));

		expect(onSignUp).toHaveBeenCalledOnce();
	});
});
