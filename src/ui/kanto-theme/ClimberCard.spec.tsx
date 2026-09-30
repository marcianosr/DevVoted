import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { kantoClimberCard } from "~/test/kantoCommunity.factory";

import { ClimberCard, COPY, type ClimberCardProps } from "./ClimberCard.ui";

const card = (over: Partial<ClimberCardProps> = {}): ClimberCardProps =>
	kantoClimberCard({
		name: "Yusuf",
		profileHref: "/profile/yusuf-id",
		...over,
	});

describe("ClimberCard", () => {
	it("links the name to the climber's in-game page, never to GitHub", () => {
		render(<ClimberCard {...card()} />);

		expect(screen.getByRole("link", { name: "Yusuf" })).toHaveAttribute(
			"href",
			"/profile/yusuf-id"
		);
		expect(
			screen
				.getAllByRole("link")
				.every((link) => !link.getAttribute("href")?.includes("github"))
		).toBe(true);
	});

	it("links the face to the climber's in-game page", () => {
		render(<ClimberCard {...card()} />);

		expect(
			screen.getByRole("link", { name: COPY.profileOf("Yusuf") })
		).toHaveAttribute("href", "/profile/yusuf-id");
	});

	it("links nothing when it was handed no page, as on a hover card", () => {
		render(<ClimberCard {...card({ profileHref: undefined })} />);

		expect(screen.queryByRole("link")).toBeNull();
		expect(screen.getAllByText("Yusuf").length).toBeGreaterThan(0);
	});

	it("badges every title they wear under their name, the first in their swatch", () => {
		render(
			<ClimberCard {...card({ titles: ["Heavy Pipeline", "Legacy Tester"] })} />
		);

		expect(screen.getByText("Heavy Pipeline")).not.toHaveAttribute(
			"data-screen-theme"
		);
		expect(screen.getByText("Legacy Tester")).toHaveAttribute(
			"data-screen-theme",
			"pewter"
		);
	});

	it("wears the swatch the player chose across its head", () => {
		render(<ClimberCard {...card({ theme: "cascade" })} />);

		expect(
			screen.getByText("Heavy Pipeline").closest("[data-gate-theme]")
		).toHaveAttribute("data-gate-theme", "cascade");
	});

	it("keeps the swatch off the standing, which wears the page", () => {
		render(<ClimberCard {...card({ theme: "cascade" })} />);

		expect(screen.getByText("Webpack").closest("[data-gate-theme]")).toBeNull();
	});

	it("draws where they stand when they have a run open", () => {
		render(<ClimberCard {...card()} />);

		expect(screen.getByText("Thunder")).toBeInTheDocument();
		expect(screen.getByText("Webpack")).toBeInTheDocument();
	});

	it("names the gate once, in the standing", () => {
		render(<ClimberCard {...card()} />);

		expect(screen.getAllByText("gate 3")).toHaveLength(1);
	});

	it("says so when the player has no run open", () => {
		render(<ClimberCard {...card({ standing: undefined })} />);

		expect(screen.getByText(COPY.noOpenRun)).toBeInTheDocument();
	});

	it("carries no privacy line and no profile press", () => {
		render(<ClimberCard {...card()} />);

		expect(screen.queryByText(/private/)).toBeNull();
		expect(screen.queryByRole("button", { name: /Profile/ })).toBeNull();
	});

	it("closes on a press of its own control", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		render(<ClimberCard {...card({ onClose })} />);

		await user.click(screen.getByRole("button", { name: /Close Yusuf/ }));

		expect(onClose).toHaveBeenCalledOnce();
	});

	it("offers no close when nothing can act on it", () => {
		render(<ClimberCard {...card()} />);

		expect(screen.queryByRole("button", { name: /Close/ })).toBeNull();
	});

	it("wears the climber's own marks, so the card and the chip agree", () => {
		const { container } = render(
			<ClimberCard {...card({ rival: true, shaky: true, rescued: true })} />
		);

		expect(container.querySelector(".climber-flicker")).toBeInTheDocument();
		expect(container.querySelector(".ring-vermillion")).toBeInTheDocument();
		expect(screen.getByTitle("Yusuf")).toHaveTextContent("tag");
	});

	it("reads out the git tag under the face of a rescued run", () => {
		render(<ClimberCard {...card({ rescued: true })} />);

		expect(screen.getByText(COPY.rescued)).toBeInTheDocument();
	});

	it("leaves a run that started from scratch without a rescue line", () => {
		render(<ClimberCard {...card()} />);

		expect(screen.queryByText(COPY.rescued)).toBeNull();
	});
});

describe("the loot a fallen card offers", () => {
	it("presses the take, stating the figure on the button", async () => {
		const onPress = vi.fn();
		render(
			<ClimberCard {...card({ loot: { label: "Loot 67 KB", onPress } })} />
		);

		await userEvent.click(screen.getByRole("button", { name: "Loot 67 KB" }));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("holds the press while the take is in flight", async () => {
		const onPress = vi.fn();
		render(
			<ClimberCard
				{...card({ loot: { label: "Loot 67 KB", onPress, pending: true } })}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: "Loot 67 KB" }));

		expect(onPress).not.toHaveBeenCalled();
	});

	it("states a spent run as a note rather than a press", () => {
		render(
			<ClimberCard {...card({ loot: { label: "looted by Misty · 67 KB" } })} />
		);

		expect(screen.getByText("looted by Misty · 67 KB")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /looted by/ })).toBeNull();
	});

	it("leaves a living climber's card without a loot row", () => {
		render(<ClimberCard {...card()} />);

		expect(screen.queryByRole("button", { name: /Loot/ })).toBeNull();
	});
});

describe("filing the incident you hold at a climber", () => {
	it("presses the filing, naming the audit it would send", async () => {
		const onPress = vi.fn();
		render(
			<ClimberCard
				{...card({ file: { label: "File 409 Conflict", onPress } })}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "File 409 Conflict" })
		);

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("holds the press while a filing is in flight", async () => {
		const onPress = vi.fn();
		render(
			<ClimberCard
				{...card({
					file: { label: "File 409 Conflict", onPress, pending: true },
				})}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "File 409 Conflict" })
		);

		expect(onPress).not.toHaveBeenCalled();
	});

	it("states why a climber is out of reach instead of pressing", () => {
		render(
			<ClimberCard
				{...card({
					file: {
						label: "File 409 Conflict",
						refusal: "409 Conflict cannot reach them",
					},
				})}
			/>
		);

		expect(
			screen.getByText("409 Conflict cannot reach them")
		).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /^File/ })).toBeNull();
	});

	it("leaves the card without a filing row while your hand is empty", () => {
		render(<ClimberCard {...card()} />);

		expect(screen.queryByRole("button", { name: /^File/ })).toBeNull();
	});
});
