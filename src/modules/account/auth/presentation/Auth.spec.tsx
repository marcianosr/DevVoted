import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
	Auth,
	type AuthProps,
} from "~/modules/account/auth/presentation/Auth.ui";

const BASE: Pick<AuthProps, "actionText" | "status" | "onSubmit"> = {
	actionText: "Login",
	status: "idle",
	onSubmit: vi.fn(),
};

const GITHUB = { pending: false, onPress: vi.fn() };

describe("Auth", () => {
	it("offers GitHub as the press and says so in the header", () => {
		render(<Auth {...BASE} github={GITHUB} />);

		expect(
			screen.getByRole("button", { name: "Continue with GitHub" })
		).toBeEnabled();
		expect(
			screen.getByText("Sign up or sign in with your GitHub account")
		).toBeInTheDocument();
	});

	it("disables the GitHub press and reads Redirecting while the redirect is pending", () => {
		render(<Auth {...BASE} github={{ pending: true, onPress: vi.fn() }} />);

		expect(screen.getByRole("button", { name: "Redirecting…" })).toBeDisabled();
	});

	it("offers the retry press and the message when login found no account", () => {
		const onRetry = vi.fn();
		render(
			<Auth
				{...BASE}
				github={GITHUB}
				message="Invalid login credentials"
				retry={{ label: "Sign up instead?", onRetry }}
			/>
		);

		expect(screen.getByText("Invalid login credentials")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Sign up instead?" })
		).toBeEnabled();
	});
});
