import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	TodayScreen,
	type TodayScreenProps,
} from "~/modules/run/run/presentation/TodayScreen.ui";

const props = (
	overrides: Partial<TodayScreenProps> = {}
): TodayScreenProps => ({
	swatch: gateSwatchAt(4),
	press: {
		label: "Resume Lavender",
		note: "Poll 3 out of 5 · New polls in 7h 23m",
		pollsLeft: 3,
		onPress: () => {},
	},
	shop: { label: "Shop", open: true, onPress: () => {} },
	standing: {
		swatches: swatchTrackFor([1, 2], 4),
		line: "gate 4 of 12 · 296 KB stored · 3 of today’s 5 left · they do not carry to tomorrow",
	},
	coverage: {
		held: 42,
		demand: 60,
		rungs: [
			{ band: "ok", label: "OK", at: "40%" },
			{ band: "healthy", label: "HEALTHY", at: "60%" },
		],
	},
	community: {
		count: 8,
		detail: "players answered today",
		href: "/run/community",
	},
	...overrides,
});

const press = (name: RegExp) => screen.getByRole("button", { name });

describe("TodayScreen", () => {
	it("leads with a press that names the gate it resumes onto", () => {
		render(<TodayScreen {...props()} />);

		expect(press(/Resume Lavender/)).toBeEnabled();
	});

	it("resumes the run when the leading press is taken", async () => {
		const onPress = vi.fn();
		render(
			<TodayScreen {...props({ press: { ...props().press, onPress } })} />
		);

		await userEvent.click(press(/Resume Lavender/));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("states the run's position and the clock inside the press itself", () => {
		render(<TodayScreen {...props()} />);

		expect(
			press(/Resume Lavender · Poll 3 out of 5 · New polls in 7h 23m/)
		).toBeInTheDocument();
	});

	it("shuts the leading press when it is given nowhere to go", () => {
		render(
			<TodayScreen
				{...props({
					press: {
						label: "New polls in 7h 23m",
						note: "today’s 5 polls are answered",
						pollsLeft: 0,
					},
				})}
			/>
		);

		expect(press(/New polls in 7h 23m/)).toBeDisabled();
	});

	it("keeps the swatch ladder and the run's standing under the press", () => {
		render(<TodayScreen {...props()} />);

		expect(
			screen.getByText(/gate 4 of 12 · 296 KB stored/)
		).toBeInTheDocument();
		expect(
			screen.getByRole("img", { name: /swatches discovered/ })
		).toBeInTheDocument();
	});

	it("drops the standing row for a player with no run yet", () => {
		render(<TodayScreen {...props({ standing: null })} />);

		expect(
			screen.queryByRole("img", { name: /swatches discovered/ })
		).toBeNull();
	});

	it("opens the shop beside the press while a gate is paying out", async () => {
		const onPress = vi.fn();
		render(<TodayScreen {...props({ shop: { ...props().shop, onPress } })} />);

		await userEvent.click(press(/Shop/));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("refuses the shop mid-gate and names the reason without printing it", () => {
		render(
			<TodayScreen
				{...props({
					shop: {
						label: "Shop",
						hint: "Shop · the shop opens when you clear a gate",
						open: false,
						onPress: () => {},
					},
				})}
			/>
		);

		expect(press(/Shop · the shop opens when you clear a gate/)).toBeDisabled();
		expect(
			screen.queryByText(/the shop opens when you clear a gate/)
		).toBeNull();
	});

	it("reads coverage held against what the gate needs", () => {
		render(<TodayScreen {...props()} />);

		expect(screen.getByText("Coverage so far")).toBeInTheDocument();
		expect(
			screen.getByRole("img", { name: "42% of 60% needed" })
		).toBeInTheDocument();
	});

	it("draws the coverage arc against a full circle, not against the rung", () => {
		const { container } = render(<TodayScreen {...props()} />);

		expect(container.querySelector(".coverage-arc")).toHaveStyle({
			strokeDashoffset: "58",
		});
	});

	it("badges a rung's percentage in its own band's colour, not in ambient grey", () => {
		render(<TodayScreen {...props()} />);

		for (const [figure, theme] of [
			["OK", "saffron"],
			["40%", "saffron"],
			["HEALTHY", "viridian"],
			["60%", "viridian"],
		])
			expect(screen.getByText(figure)).toHaveAttribute(
				"data-screen-theme",
				theme
			);
	});

	it("says nothing about coverage before a run is open", () => {
		render(<TodayScreen {...props({ coverage: null })} />);

		expect(screen.queryByText("Coverage so far")).toBeNull();
	});

	it("badges the room's count and opens the board", () => {
		render(<TodayScreen {...props()} />);

		expect(screen.getByText("8")).toBeInTheDocument();
		expect(screen.getByText("players answered today")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /Community/ })).toHaveAttribute(
			"href",
			"/run/community"
		);
	});

	it("holds the community card back until the room has been counted", () => {
		render(<TodayScreen {...props({ community: null })} />);

		expect(screen.queryByText("Community")).toBeNull();
	});

	it("states a refused start rather than dropping it", () => {
		render(
			<TodayScreen
				{...props({ refusal: "You already have a run going today." })}
			/>
		);

		expect(
			screen.getByText("You already have a run going today.")
		).toBeInTheDocument();
	});
});
