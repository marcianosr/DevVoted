import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Upgrades, type UpgradeRung } from "./Upgrades.ui";

const RUNGS = [
	{ version: 1, effect: "+2%", state: "owned" },
	{ version: 2, effect: "+4%", state: "owned", held: true },
	{ version: 3, effect: "+6%", state: "offered", price: "96 KB" },
	{ version: 4, effect: "+8%", state: "future", price: "128 KB" },
	{ version: 5, effect: "+10%", state: "future", price: "160 KB" },
] satisfies UpgradeRung[];

const PANEL = {
	name: "Moore's Law",
	description: "A share of held storage, paid on every gate clear.",
	rungs: RUNGS,
	toMax: { version: 5, price: "384 KB" },
};

const refused = (rungs: readonly UpgradeRung[]) =>
	rungs.map((rung) =>
		rung.state === "offered" ? { ...rung, disabled: true } : rung
	);

const sentence = (text: string) =>
	screen.getByText((_, element) => element?.textContent === text);

describe("Upgrades", () => {
	it("names the config and says what it does", () => {
		render(<Upgrades {...PANEL} />);

		expect(screen.getByText("Moore's Law")).toBeInTheDocument();
		expect(
			screen.getByText("A share of held storage, paid on every gate clear.")
		).toBeInTheDocument();
	});

	it("pairs the installed version with the one on offer", () => {
		render(<Upgrades {...PANEL} />);

		expect(screen.getByText("v2")).toBeInTheDocument();
		expect(screen.getByText("+4%")).toBeInTheDocument();
		expect(screen.getByText("v3")).toBeInTheDocument();
		expect(screen.getByText("+6%")).toBeInTheDocument();
	});

	it("keeps the versions beyond the offer off the panel", () => {
		render(<Upgrades {...PANEL} />);

		expect(screen.queryByText("v4")).not.toBeInTheDocument();
		expect(screen.queryByText("v5")).not.toBeInTheDocument();
		expect(screen.queryByText("128 KB")).not.toBeInTheDocument();
	});

	it("prices the offer and nothing else, since nothing else is for sale", () => {
		render(<Upgrades {...PANEL} />);

		expect(screen.getByText("96 KB")).toBeInTheDocument();
		expect(screen.queryByText("160 KB")).not.toBeInTheDocument();
	});

	it("labels the two cards in lower case, as the kit writes everything", () => {
		render(<Upgrades {...PANEL} />);

		expect(screen.getByText("installed")).toBeInTheDocument();
		expect(screen.getByText("next")).toBeInTheDocument();
	});

	it.each(["installed", "next"] as const)(
		"sets the %s label small and bold in the screen's accent",
		(label) => {
			render(<Upgrades {...PANEL} />);

			expect(screen.getByText(label)).toHaveClass(
				"text-xs",
				"font-bold",
				"text-theme-soft"
			);
		}
	);

	it("gives the description the screen's accent, not the footer's grey", () => {
		render(<Upgrades {...PANEL} />);

		expect(screen.getByText(PANEL.description)).toHaveClass(
			"text-sm",
			"text-theme-soft"
		);
	});

	it("badges the effect as a gain, green on both cards", () => {
		render(<Upgrades {...PANEL} />);

		for (const effect of ["+4%", "+6%"]) {
			expect(screen.getByText(effect)).toHaveClass("badge-theme");
			expect(screen.getByText(effect)).toHaveAttribute(
				"data-screen-theme",
				"viridian"
			);
		}
	});

	it("keeps the gain green on an offer it cannot pay for", () => {
		render(<Upgrades {...PANEL} rungs={refused(RUNGS)} />);

		expect(screen.getByText("+6%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("96 KB")).not.toHaveAttribute("data-screen-theme");
	});

	it("sizes the panel to its contents rather than to a fixed column", () => {
		const { container } = render(<Upgrades {...PANEL} />);

		expect(container.firstChild).toHaveClass("w-fit", "max-w-112");
		expect(container.firstChild).not.toHaveClass("w-80");
	});

	it("greens the offered version, so the press has a target", () => {
		render(<Upgrades {...PANEL} />);

		expect(screen.getByText("v3")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("reddens the offered version once it is out of budget", () => {
		render(<Upgrades {...PANEL} rungs={refused(RUNGS)} />);

		expect(screen.getByText("v3")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it.each([
		["viridian", RUNGS],
		["cinnabar", refused(RUNGS)],
	] as const)(
		"paints the offer card %s, the same as the pennant inside it",
		(color, rungs) => {
			render(<Upgrades {...PANEL} rungs={rungs} onBuy={vi.fn()} />);

			expect(screen.getByRole("button", { name: /Buy v3/ })).toHaveAttribute(
				"data-screen-theme",
				color
			);
		}
	);

	it("leaves the installed card uncoloured, since it is not for sale", () => {
		render(<Upgrades {...PANEL} />);

		expect(screen.getByText("v2")).not.toHaveAttribute("data-screen-theme");
		expect(screen.getByText("installed").parentElement).not.toHaveAttribute(
			"data-screen-theme"
		);
	});

	it("holds the arrow between the cards out of the accessibility tree", () => {
		render(<Upgrades {...PANEL} />);

		expect(screen.getByText("→")).toHaveAttribute("aria-hidden");
	});

	it("totals the climb and names what a press would buy", () => {
		render(<Upgrades {...PANEL} />);

		expect(
			sentence("all the way to v5 costs 384 KB · press to buy v3")
		).toBeInTheDocument();
	});

	it("drops the footer for a config with nothing left to buy", () => {
		render(
			<Upgrades
				name="A/B Test"
				description="Pick an arm."
				rungs={[{ version: 1, effect: "×1.25", state: "owned", held: true }]}
			/>
		);

		expect(screen.queryByText(/all the way/)).not.toBeInTheDocument();
	});

	it("says a config is fully upgraded only when every version is held", () => {
		render(
			<Upgrades
				name="A/B Test"
				description="Pick an arm."
				rungs={[
					{ version: 1, effect: "×1.25", state: "owned" },
					{ version: 2, effect: "×1.5", state: "owned", held: true },
				]}
			/>
		);

		expect(screen.getByText("fully upgraded")).toBeInTheDocument();
	});

	it("says nothing is on offer while versions are still out of reach", () => {
		render(
			<Upgrades
				{...PANEL}
				rungs={[
					{ version: 1, effect: "+2%", state: "owned", held: true },
					{ version: 2, effect: "+4%", state: "future", price: "64 KB" },
				]}
			/>
		);

		expect(screen.getByText("nothing on offer")).toBeInTheDocument();
		expect(screen.queryByText("fully upgraded")).not.toBeInTheDocument();
	});

	it("still totals the climb when nothing is on offer this gate", () => {
		render(
			<Upgrades
				{...PANEL}
				rungs={[
					{ version: 1, effect: "+2%", state: "owned", held: true },
					{ version: 2, effect: "+4%", state: "future", price: "64 KB" },
				]}
			/>
		);

		expect(sentence("all the way to v5 costs 384 KB")).toBeInTheDocument();
	});

	it("makes the offer card the buy control", async () => {
		const onBuy = vi.fn();
		render(<Upgrades {...PANEL} onBuy={onBuy} />);

		await userEvent.click(
			screen.getByRole("button", { name: "Buy v3 · 96 KB" })
		);

		expect(onBuy).toHaveBeenCalledWith(3);
	});

	it("leaves the installed card inert, since holding it is not a decision", () => {
		render(<Upgrades {...PANEL} onBuy={vi.fn()} />);

		expect(screen.getAllByRole("button")).toHaveLength(1);
	});

	it("presses nothing at all when there is nothing to spend on", () => {
		render(<Upgrades {...PANEL} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("refuses the offer the player cannot afford, with the price still shown", async () => {
		const onBuy = vi.fn();
		render(<Upgrades {...PANEL} onBuy={onBuy} rungs={refused(RUNGS)} />);

		const offer = screen.getByRole("button", { name: /Buy v3/ });
		await userEvent.click(offer);

		expect(onBuy).not.toHaveBeenCalled();
		expect(offer).toBeDisabled();
		expect(screen.getByText("96 KB")).toBeInTheDocument();
	});

	it("names the offer by what buying it costs, not by its number alone", () => {
		render(<Upgrades {...PANEL} onBuy={vi.fn()} />);

		expect(
			screen.getByRole("button", { name: "Buy v3 · 96 KB" })
		).toBeInTheDocument();
	});
});
