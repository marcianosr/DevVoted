import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	Appearance,
	COPY,
	type AppearanceProps,
} from "~/modules/account/profile/presentation/Appearance.ui";

const TESTER = "title-legacy-tester";
const CSS_CARRIER = "title-answered-css";

const handlers = {
	onPickBorder: vi.fn(),
	onToggleTitle: vi.fn(),
	onMoreBorders: vi.fn(),
	onMoreTitles: vi.fn(),
	onPickSwatch: vi.fn(),
	onSave: vi.fn(),
};

const PALLET = swatchForGate(0);
const CERULEAN = swatchForGate(2);

const PROPS: AppearanceProps = {
	face: { name: "misty_cerulean", titles: ["Legacy Tester"] },
	borders: [
		{ id: null, name: "Default", picked: false },
		{
			id: "border-00b9a62e",
			name: "Stack Trace",
			image: "/borders/stack-trace.png",
			picked: true,
		},
	],
	borderTally: { held: 1, total: 32 },
	titles: [
		{ id: TESTER, name: "Legacy Tester", wornAt: 1, blocked: false },
		{ id: CSS_CARRIER, name: "CSS Carrier", wornAt: null, blocked: false },
	],
	titleTally: { held: 2, total: 46 },
	swatches: [
		...(PALLET === undefined
			? []
			: [
					{
						id: PALLET.id,
						name: PALLET.gateName,
						state: "owned" as const,
						fill: { state: "discovered" as const, swatch: PALLET },
					},
				]),
		...(CERULEAN === undefined
			? []
			: [
					{
						id: CERULEAN.id,
						name: CERULEAN.gateName,
						state: "worn" as const,
						fill: { state: "discovered" as const, swatch: CERULEAN },
					},
				]),
		{
			id: "swatch-viridian",
			name: "Viridian",
			state: "locked",
			fill: { state: "undiscovered" },
		},
	],
	canSave: false,
	...handlers,
};

const renderAppearance = (props: Partial<AppearanceProps> = {}) =>
	render(<Appearance {...PROPS} {...props} />);

describe("Appearance", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("the swatch row", () => {
		it("says what a swatch does beneath its heading", () => {
			renderAppearance();

			expect(
				screen.getByText(
					"Tap to change your theme on your profile and dev card"
				)
			).toHaveClass("basis-full");
			expect(
				screen.queryByText("tap to wear · themes your profile")
			).not.toBeInTheDocument();
		});

		it("presses the worn swatch down and names it", () => {
			renderAppearance();

			expect(
				screen.getByRole("button", { name: "Wear Cerulean" })
			).toHaveAttribute("aria-pressed", "true");
		});

		it("drafts an earned swatch when pressed", async () => {
			renderAppearance();

			await userEvent.click(
				screen.getByRole("button", { name: "Wear Pallet" })
			);

			expect(handlers.onPickSwatch).toHaveBeenCalledWith("swatch-pallet");
		});

		it("withholds an unearned swatch's name and refuses the press", () => {
			renderAppearance();

			expect(screen.queryByText("Viridian")).not.toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: COPY.lockedSwatch })
			).toBeDisabled();
		});
	});

	it("badges every figure in the title and border tally", () => {
		renderAppearance({
			titleTally: { held: 41, total: 49 },
			borderTally: { held: 17, total: 32 },
		});

		for (const figure of ["41", "49", "17", "32"])
			expect(screen.getByText(figure, { selector: "span" })).toBeVisible();
	});

	it("holds the save press back while the look is unchanged", () => {
		renderAppearance();

		expect(screen.getByRole("button", { name: COPY.save })).toBeDisabled();
	});

	it("saves the look once something changed", async () => {
		renderAppearance({ canSave: true });

		await userEvent.click(screen.getByRole("button", { name: COPY.save }));

		expect(handlers.onSave).toHaveBeenCalledOnce();
	});

	it("picks the default border to wear none", async () => {
		renderAppearance();

		await userEvent.click(
			screen.getByRole("button", { name: COPY.pickBorder("Default") })
		);

		expect(handlers.onPickBorder).toHaveBeenCalledWith(null);
	});

	it("marks the picked border pressed", () => {
		renderAppearance();

		expect(
			screen.getByRole("button", { name: COPY.pickBorder("Stack Trace") })
		).toHaveAttribute("aria-pressed", "true");
	});

	it("sends the player to the Dex for the borders they do not own", async () => {
		renderAppearance();

		await userEvent.click(
			screen.getByRole("button", {
				name: COPY.moreBordersHint(PROPS.borderTally),
			})
		);

		expect(handlers.onMoreBorders).toHaveBeenCalledOnce();
	});

	it("toggles an earned title from its chip", async () => {
		renderAppearance();

		await userEvent.click(screen.getByRole("button", { name: "CSS Carrier" }));

		expect(handlers.onToggleTitle).toHaveBeenCalledWith(CSS_CARRIER);
	});

	it("refuses a title chip once the card is full", () => {
		renderAppearance({
			titles: [
				{ id: CSS_CARRIER, name: "CSS Carrier", wornAt: null, blocked: true },
			],
		});

		expect(screen.getByRole("button", { name: "CSS Carrier" })).toBeDisabled();
	});

	it("names the border being tried on", () => {
		renderAppearance({ tryingOn: "Merge Conflict" });

		expect(
			screen.getByText(COPY.tryingOn("Merge Conflict"))
		).toBeInTheDocument();
	});
});
