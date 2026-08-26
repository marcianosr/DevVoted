import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	TodayScreen,
	type TodayRun,
	type TodayScreenProps,
} from "./TodayScreen.ui";

const GATES = Array.from({ length: 13 }, (_, gate) => ({
	gate,
	theme: "pallet" as const,
}));

const onLavender = (overrides: Partial<TodayRun> = {}): TodayRun => ({
	gateName: "Lavender",
	theme: "lavender",
	gatesCleared: 4,
	gateCount: 12,
	days: 6,
	storageKb: 296,
	gates: GATES,
	live: true,
	...overrides,
});

const props = (
	overrides: Partial<TodayScreenProps> = {}
): TodayScreenProps => ({
	run: onLavender(),
	polls: { ready: true, count: 5 },
	onStart: () => {},
	onResume: () => {},
	dailyPoll: { questions: 5, answeredBy: 8, onAnswer: () => {} },
	community: { runsLive: 8, onOpen: () => {} },
	...overrides,
});

const press = (name: RegExp) => screen.getByRole("button", { name });

describe("TodayScreen", () => {
	it("names the gate a live run is standing on", () => {
		render(<TodayScreen {...props()} />);

		expect(screen.getByText("Your run is on Lavender")).toBeInTheDocument();
	});

	it("resumes a live run whose polls are ready", async () => {
		const onResume = vi.fn();
		render(<TodayScreen {...props({ onResume })} />);

		await userEvent.click(press(/Resume/));

		expect(onResume).toHaveBeenCalledOnce();
	});

	it("says today's polls are waiting, in the run's own colour", () => {
		render(<TodayScreen {...props()} />);

		expect(screen.getByText("today's 5 polls are ready")).toBeInTheDocument();
	});

	it("puts the wait on the press that would have played, once the day is spent", async () => {
		const onResume = vi.fn();
		render(
			<TodayScreen
				{...props({
					onResume,
					polls: { ready: false, opensIn: "New polls in 7h 23m" },
				})}
			/>
		);

		const waiting = press(/New polls in 7h 23m/);
		await userEvent.click(waiting);

		expect(waiting).toBeDisabled();
		expect(onResume).not.toHaveBeenCalled();
		expect(screen.queryByRole("button", { name: /Resume/ })).toBeNull();
	});

	it("reads a finished run as history and offers a new climb", () => {
		render(<TodayScreen {...props({ run: onLavender({ live: false }) })} />);

		expect(
			screen.getByText("Your last run reached Lavender")
		).toBeInTheDocument();
		expect(press(/Start today’s climb/)).toBeEnabled();
		expect(screen.queryByRole("button", { name: /Resume/ })).toBeNull();
	});

	it("counts days one way while climbing and the other way looking back", () => {
		const { rerender } = render(<TodayScreen {...props()} />);
		expect(screen.getByText(/day 6/)).toBeInTheDocument();

		rerender(<TodayScreen {...props({ run: onLavender({ live: false }) })} />);
		expect(screen.getByText(/6 days/)).toBeInTheDocument();
	});

	it("reports no past climb to a player who has never had one", () => {
		render(<TodayScreen {...props({ run: null })} />);

		expect(screen.getByText("Today’s climb")).toBeInTheDocument();
		expect(screen.queryByText(/last run/)).toBeNull();
		expect(press(/Start today’s climb/)).toBeEnabled();
	});

	it("keeps all three rows whatever the run is doing", () => {
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

	it("drops a count's clause rather than printing a figure it has not got", () => {
		render(
			<TodayScreen
				{...props({
					run: onLavender({ days: undefined }),
					dailyPoll: { questions: 5, onAnswer: () => {} },
					community: { onOpen: () => {} },
				})}
			/>
		);

		expect(screen.queryByText(/day 6|6 days/)).toBeNull();
		expect(screen.queryByText(/have answered/)).toBeNull();
		expect(screen.queryByText(/runs live/)).toBeNull();
		expect(press(/Open board/)).toBeEnabled();
	});

	it("says run, not runs, when there is only one of anything", () => {
		render(
			<TodayScreen
				{...props({
					polls: { ready: true, count: 1 },
					dailyPoll: { questions: 1, onAnswer: () => {} },
					community: { runsLive: 1, onOpen: () => {} },
				})}
			/>
		);

		expect(screen.getByText("today's 1 poll is ready")).toBeInTheDocument();
		expect(screen.getByText("1 run live")).toBeInTheDocument();
		expect(
			screen.getByText(/^1 question, shared by everyone/)
		).toBeInTheDocument();
	});

	it("holds the start press while a run is being opened", async () => {
		const onStart = vi.fn();
		render(<TodayScreen {...props({ run: null, onStart, starting: true })} />);

		await userEvent.click(press(/Start today’s climb/));

		expect(onStart).not.toHaveBeenCalled();
	});

	it("states a refused start in the failure tone, not as more blurb", () => {
		render(
			<TodayScreen
				{...props({ error: "You already have a run going today." })}
			/>
		);

		expect(screen.getByText("You already have a run going today.")).toHaveClass(
			"text-cinnabar"
		);
	});

	it("wears no gate colour: the run's own row carries that, not the page", () => {
		const { container } = render(<TodayScreen {...props()} />);

		expect(container.querySelector("[data-gate-theme]")).toBeNull();
	});
});
