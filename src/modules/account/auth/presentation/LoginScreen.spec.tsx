import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
	FIRST_STEP,
	demoCardFor,
	heroFor,
} from "~/modules/account/auth/application/loginDemo.viewmodel";
import {
	type DevSignIn,
	LoginScreen,
	type LoginScreenProps,
} from "~/modules/account/auth/presentation/LoginScreen.ui";

const BASE: LoginScreenProps = {
	theme: "cerulean",
	hero: heroFor(),
	card: demoCardFor(FIRST_STEP),
	github: { pending: false, onPress: vi.fn() },
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

	it("hides the wiki link without a wiki address", () => {
		render(<LoginScreen {...BASE} wikiHref={undefined} />);

		expect(
			screen.queryByText("Read how this game works")
		).not.toBeInTheDocument();
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
