import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
	onSave: vi.fn(),
};

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
	canSave: false,
	...handlers,
};

const renderAppearance = (props: Partial<AppearanceProps> = {}) =>
	render(<Appearance {...PROPS} {...props} />);

describe("Appearance", () => {
	beforeEach(() => {
		vi.clearAllMocks();
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
