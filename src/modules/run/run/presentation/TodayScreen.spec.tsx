import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	TodayScreen,
	type TodayRun,
	type TodayScreenProps,
} from "~/modules/run/run/presentation/TodayScreen.ui";

const onLavender = (overrides: Partial<TodayRun> = {}): TodayRun => ({
	title: "Your run is on Lavender",
	standing: "gate 4 of 12 · 296 KB stored",
	swatches: swatchTrackFor([1, 2], 4),
	pollsNote: "today’s 5 polls are ready",
	...overrides,
});

const props = (
	overrides: Partial<TodayScreenProps> = {}
): TodayScreenProps => ({
	swatch: gateSwatchAt(4),
	run: onLavender(),
	action: { label: "Resume", onPress: () => {} },
	polls: {
		detail: "5 questions, shared by everyone · 8 have answered",
		press: { label: "Answer it", onPress: () => {} },
	},
	community: {
		detail: "see how everyone else is doing today",
		press: { label: "Open board", onPress: () => {} },
	},
	...overrides,
});

const press = (name: RegExp) => screen.getByRole("button", { name });

describe("TodayScreen", () => {
	it("names the gate a live run is standing on", () => {
		render(<TodayScreen {...props()} />);

		expect(screen.getByText("Your run is on Lavender")).toBeInTheDocument();
	});

	it("resumes a live run whose polls are ready", async () => {
		const onPress = vi.fn();
		render(
			<TodayScreen {...props({ action: { label: "Resume", onPress } })} />
		);

		await userEvent.click(press(/Resume/));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("says today's polls are waiting", () => {
		render(<TodayScreen {...props()} />);

		expect(screen.getByText("today’s 5 polls are ready")).toBeInTheDocument();
	});

	it("puts the wait on the press that would have played, once the day is spent", async () => {
		render(
			<TodayScreen
				{...props({
					action: { label: "New polls in 7h 23m" },
					run: onLavender({ pollsNote: "New polls in 7h 23m" }),
				})}
			/>
		);

		expect(press(/New polls in 7h 23m/)).toBeDisabled();
		expect(screen.queryByRole("button", { name: /Resume/ })).toBeNull();
	});

	it("reads a finished run as history and offers a new climb", () => {
		render(
			<TodayScreen
				{...props({
					run: onLavender({
						title: "Your last run reached Lavender",
						standing: "gate 4 of 12 · 296 KB banked",
					}),
					action: { label: "Start today’s climb", onPress: () => {} },
				})}
			/>
		);

		expect(
			screen.getByText("Your last run reached Lavender")
		).toBeInTheDocument();
		expect(press(/Start today’s climb/)).toBeEnabled();
		expect(screen.queryByRole("button", { name: /Resume/ })).toBeNull();
	});

	it("reports no past climb to a player who has never had one", () => {
		render(
			<TodayScreen
				{...props({
					run: null,
					action: { label: "Start today’s climb", onPress: () => {} },
				})}
			/>
		);

		expect(screen.getByText("Today’s climb")).toBeInTheDocument();
		expect(screen.queryByText(/last run/)).toBeNull();
		expect(press(/Start today’s climb/)).toBeEnabled();
	});

	it("keeps both rows whatever the run is doing", () => {
		render(<TodayScreen {...props({ run: null })} />);

		expect(screen.getByText("Today’s polls")).toBeInTheDocument();
		expect(screen.getByText("Community")).toBeInTheDocument();
	});

	it("counts the day's shared set rather than calling it one question", () => {
		render(<TodayScreen {...props()} />);

		expect(
			screen.getByText("5 questions, shared by everyone · 8 have answered")
		).toBeInTheDocument();
	});

	it("holds the start press while a run is being opened", async () => {
		render(
			<TodayScreen
				{...props({ run: null, action: { label: "Start today’s climb" } })}
			/>
		);

		expect(press(/Start today’s climb/)).toBeDisabled();
	});

	it("states a refused start rather than dropping it", () => {
		render(
			<TodayScreen
				{...props({ error: "You already have a run going today." })}
			/>
		);

		expect(
			screen.getByText("You already have a run going today.")
		).toBeInTheDocument();
	});
});
