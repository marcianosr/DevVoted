import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
	FIRST_STEP,
	demoCardFor,
	heroFor,
} from "~/modules/account/auth/application/loginDemo.viewmodel";
import {
	COPY,
	type DevSignIn,
	LoginScreen,
	type LoginScreenProps,
} from "~/modules/account/auth/presentation/LoginScreen.ui";

const BASE: LoginScreenProps = {
	theme: "cerulean",
	hero: heroFor(),
	card: demoCardFor(FIRST_STEP),
	github: { pending: false, onPress: vi.fn() },
	guest: { pending: false, onPress: vi.fn() },
	wikiHref: "/wiki",
};

const DEV_EMAIL: DevSignIn = {
	method: "email",
	onMethod: vi.fn(),
	email: { actionText: "Login", status: "idle", onSubmit: vi.fn() },
};

describe("LoginScreen", () => {
	it("leads with the two headline lines, the pitch and the three figures", () => {
		render(<LoginScreen {...BASE} />);

		expect(
			screen.getByRole("heading", {
				name: "Five dev polls a day.How far can you run?",
			})
		).toBeInTheDocument();
		expect(screen.getByText("polls a day")).toBeInTheDocument();
		expect(screen.getByText("12")).toBeInTheDocument();
		expect(screen.getByText("Champion")).toBeInTheDocument();
	});

	it("offers GitHub as the one press, with the wiki link under it", () => {
		render(<LoginScreen {...BASE} />);

		expect(
			screen.getByRole("button", { name: "Continue with GitHub" })
		).toBeEnabled();
		expect(
			screen.getByRole("link", { name: "Read how this game works" })
		).toHaveAttribute("href", "/wiki");
	});

	it("offers today's five without an account and starts it on press", async () => {
		const onPress = vi.fn();
		render(<LoginScreen {...BASE} guest={{ pending: false, onPress }} />);

		await userEvent.click(
			screen.getByRole("button", { name: "Play today without an account" })
		);

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("leaves out the guest press for a visitor who already plays as a guest", () => {
		render(<LoginScreen {...BASE} guest={undefined} />);

		expect(
			screen.queryByRole("button", { name: "Play today without an account" })
		).not.toBeInTheDocument();
	});

	it("disables the guest press and reads Starting while the guest session opens", () => {
		render(
			<LoginScreen {...BASE} guest={{ pending: true, onPress: vi.fn() }} />
		);

		expect(screen.getByRole("button", { name: "Starting…" })).toBeDisabled();
	});

	it("disables the press and reads Redirecting while the redirect is pending", () => {
		render(
			<LoginScreen {...BASE} github={{ pending: true, onPress: vi.fn() }} />
		);

		expect(screen.getByRole("button", { name: "Redirecting…" })).toBeDisabled();
	});

	it("draws today's poll with its category, counter, question and three choices", () => {
		render(<LoginScreen {...BASE} />);

		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("1 of 5")).toBeInTheDocument();
		expect(
			screen.getByText("Which one is a valid arrow function?")
		).toBeInTheDocument();
		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("B")).toBeInTheDocument();
		expect(screen.getByText("C")).toBeInTheDocument();
	});

	it("marks the picked choice right once the card has answered", () => {
		const { container } = render(
			<LoginScreen {...BASE} card={demoCardFor({ poll: 0, phase: "picked" })} />
		);

		expect(
			container.querySelector('[data-answer="right"][data-picked="true"]')
		).not.toBeNull();
	});

	it("shows neither a method switch nor an email form unless development hands them in", () => {
		render(<LoginScreen {...BASE} />);

		expect(screen.queryByText("Email")).toBeNull();
		expect(screen.queryByRole("heading", { name: "Login" })).toBeNull();
	});

	it("opens on the email form in development, with GitHub a switch away", () => {
		render(<LoginScreen {...BASE} devSignIn={DEV_EMAIL} />);

		expect(screen.getByText("Email")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Continue with GitHub" })
		).toBeNull();
	});

	it("shows the GitHub press once GitHub is the chosen method", () => {
		render(
			<LoginScreen {...BASE} devSignIn={{ ...DEV_EMAIL, method: "github" }} />
		);

		expect(
			screen.getByRole("button", { name: "Continue with GitHub" })
		).toBeEnabled();
		expect(screen.queryByRole("heading", { name: "Login" })).toBeNull();
	});
});

describe("a GitHub account that already plays here", () => {
	it("says so under the press, so the next press is understood as a plain sign-in", () => {
		render(<LoginScreen {...BASE} identityTaken />);

		expect(screen.getByText(COPY.identityTaken)).toBeInTheDocument();
	});

	it("says nothing of it on an ordinary visit", () => {
		render(<LoginScreen {...BASE} />);

		expect(screen.queryByText(COPY.identityTaken)).not.toBeInTheDocument();
	});
});
