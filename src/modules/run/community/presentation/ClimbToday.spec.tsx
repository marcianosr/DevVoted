import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
	ClimbClimber,
	ClimbFallen,
	ClimbTodayView,
} from "~/modules/run/community/application/community.service";

import { ClimbToday } from "~/modules/run/community/presentation/ClimbToday.ui";

const climber = (
	id: string,
	gate: number,
	pollsIntoGate: number,
	you = false
): ClimbClimber => ({
	id,
	displayName: id,
	photoUrl: null,
	gate,
	pollsIntoGate,
	you,
});

const fallen = (
	runId: number,
	displayName: string,
	gate: number,
	pollsIntoGate: number
): ClimbFallen => ({
	runId,
	id: displayName.toLowerCase(),
	displayName,
	photoUrl: null,
	gate,
	pollsIntoGate,
});

const view = (overrides: Partial<ClimbTodayView> = {}): ClimbTodayView => ({
	climbers: [
		climber("Green", 2, 4),
		climber("Red", 6, 3, true),
		climber("Blue", 7, 1),
	],
	fallen: [fallen(11, "Koga", 5, 2)],
	bestPosition: 31,
	...overrides,
});

/** jsdom has no matchMedia layout, so the component's guards default it wide. */
const givenAPhone = () =>
	vi.stubGlobal(
		"matchMedia",
		vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() })
	);

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("ClimbToday", () => {
	it("draws an avatar for every climber", () => {
		render(<ClimbToday {...view()} />);

		expect(screen.getByTitle("Red")).toBeInTheDocument();
		expect(screen.getByTitle("Blue")).toBeInTheDocument();
		expect(screen.getByTitle("Green")).toBeInTheDocument();
		expect(screen.getByText("you")).toBeInTheDocument();
	});

	it("shows the whole ladder where it fits, summit included", () => {
		render(<ClimbToday {...view()} />);

		expect(screen.getByText("Pallet")).toBeInTheDocument();
		expect(screen.getByText("Soul")).toBeInTheDocument();
		expect(screen.getByText("Champion")).toBeInTheDocument();
	});

	it("offers no paging chrome — the track scrolls instead", () => {
		render(<ClimbToday {...view()} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("marks each run that ended today with its player, named on hover", () => {
		render(
			<ClimbToday
				{...view({
					fallen: [fallen(11, "Koga", 5, 2), fallen(12, "Janine", 6, 1)],
				})}
			/>
		);

		expect(screen.getByText("Koga — ended here")).toBeInTheDocument();
		expect(screen.getByText("Janine — ended here")).toBeInTheDocument();
		expect(screen.queryByText("†")).not.toBeInTheDocument();
	});

	it("keeps a player who lost twice today on the map once per run", () => {
		render(
			<ClimbToday
				{...view({
					fallen: [fallen(11, "Koga", 5, 2), fallen(12, "Koga", 6, 1)],
				})}
			/>
		);

		expect(screen.getAllByText("Koga — ended here")).toHaveLength(2);
	});

	it("leaves a wide uncharted zone to its dashed edge", () => {
		// Charted to gate 6 of 12: half the track is unknown, and a texture that
		// big stops reading as a marker.
		render(<ClimbToday {...view()} />);

		expect(
			screen.getByText("Uncharted").parentElement?.style.backgroundImage
		).toBe("");
	});

	it("hatches the uncharted zone once it is narrow enough to read as a marker", () => {
		// Charted to gate 10 poll 2 of 12: a fifth of the track left, narrow
		// enough that the texture still reads as a marker.
		render(
			<ClimbToday
				{...view({
					climbers: [climber("Red", 10, 2, true)],
					bestPosition: null,
				})}
			/>
		);

		expect(
			screen.getByText("Uncharted").parentElement?.style.backgroundImage
		).toContain("repeating-linear-gradient");
	});

	it("shows no best marker on a first climb", () => {
		const { container } = render(
			<ClimbToday {...view({ bestPosition: null })} />
		);

		expect(container.querySelector(".border-zinc-500")).not.toBeInTheDocument();
	});

	it("stacks climbers sharing a position behind a single overflow badge", () => {
		render(
			<ClimbToday
				{...view({
					climbers: [
						climber("Red", 6, 3, true),
						climber("Blue", 6, 3),
						climber("Green", 6, 3),
						climber("Yellow", 6, 3),
					],
				})}
			/>
		);

		expect(screen.getByText("+1")).toBeInTheDocument();
	});

	it("drops the progress copy and the legend — the map is the whole card", () => {
		render(<ClimbToday {...view()} />);

		expect(screen.queryByText(/polls into/)).not.toBeInTheDocument();
		expect(screen.queryByText(/your best/)).not.toBeInTheDocument();
		expect(screen.queryByText(/a run ended here/)).not.toBeInTheDocument();
	});
});

describe("ClimbToday on a narrow screen", () => {
	it("keeps the whole ladder and lets the track scroll to it", () => {
		givenAPhone();

		const { container } = render(<ClimbToday {...view()} />);

		// No window and no paging: every gate is present at any width, and a
		// screen too narrow for them swipes.
		expect(screen.getByText("Pallet")).toBeInTheDocument();
		expect(screen.getByText("Champion")).toBeInTheDocument();
		expect(container.querySelector(".overflow-x-auto")).toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("opens scrolled to where the viewer is standing", () => {
		givenAPhone();
		// jsdom reports zero for both, so the centring maths must survive it.
		const { container } = render(<ClimbToday {...view()} />);

		const scroller = container.querySelector(".overflow-x-auto");
		expect(scroller?.scrollLeft).toBe(0);
	});
});
