import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClimberCard, COPY, type ClimberCardProps } from "./ClimberCard.ui";

const BUILD = [
	{ name: "Webpack", slots: 3, badges: [] },
	{ name: "Babel", slots: 2, badges: [] },
];

const card = (over: Partial<ClimberCardProps> = {}): ClimberCardProps => ({
	name: "Yusuf",
	gate: "gate 5 · Rainbow",
	weight: "14 of 16 weight",
	build: BUILD,
	stats: [],
	...over,
});

describe("ClimberCard", () => {
	it("names the climber and links them to their GitHub account", () => {
		render(<ClimberCard {...card({ handle: "yusuf" })} />);

		const link = screen.getByRole("link", { name: "@yusuf" });
		expect(link).toHaveAttribute("href", "https://github.com/yusuf");
		expect(link).toHaveAttribute("target", "_blank");
	});

	it("falls back to the display name for an account with no GitHub handle", () => {
		render(<ClimberCard {...card()} />);

		expect(screen.queryByRole("link")).toBeNull();
		expect(screen.getAllByText("Yusuf").length).toBeGreaterThan(0);
	});

	it("states the title they wear under their name", () => {
		render(<ClimberCard {...card({ title: "Heavy Pipeline" })} />);

		expect(screen.getByText("Heavy Pipeline")).toBeInTheDocument();
	});

	it("says where they stand, how the last gate closed and what they have banked", () => {
		render(<ClimberCard {...card({ band: "healthy", coveragePercent: 70 })} />);

		expect(screen.getByText("gate 5 · Rainbow")).toBeInTheDocument();
		expect(screen.getByText("HEALTHY")).toBeInTheDocument();
		expect(screen.getByText("70%")).toBeInTheDocument();
	});

	it("leaves the band off a run that has closed no gate yet", () => {
		render(<ClimberCard {...card()} />);

		expect(screen.queryByText("HEALTHY")).toBeNull();
		expect(screen.queryByText("SHAKY")).toBeNull();
	});

	it("states the weight the build carries and the storage behind it", () => {
		render(<ClimberCard {...card({ storage: "896 KB" })} />);

		expect(screen.getByText("14 of 16 weight")).toBeInTheDocument();
		expect(screen.getByText("896 KB")).toBeInTheDocument();
	});

	it("draws the build as config chips", () => {
		render(<ClimberCard {...card()} />);

		expect(screen.getByText("Webpack")).toBeInTheDocument();
		expect(screen.getByText("Babel")).toBeInTheDocument();
	});

	it("says so when the climber runs nothing at all", () => {
		render(<ClimberCard {...card({ build: [] })} />);

		expect(screen.getByText(COPY.nothingInstalled)).toBeInTheDocument();
	});

	it("draws a tile for every figure it was handed", () => {
		render(
			<ClimberCard
				{...card({
					stats: [
						{ label: COPY.streak, value: "6" },
						{ label: COPY.bestCategory, value: "JS" },
						{ label: COPY.gate, value: "5" },
					],
				})}
			/>
		);

		expect(screen.getByText(COPY.streak)).toBeInTheDocument();
		expect(screen.getByText("6")).toBeInTheDocument();
		expect(screen.getByText("JS")).toBeInTheDocument();
	});

	it("states what a card never shows, so the reader knows this is all of it", () => {
		render(<ClimberCard {...card()} />);

		expect(screen.getByText(COPY.privately)).toBeInTheDocument();
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
});
