import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MAX_SLOTS } from "~/modules/run/pipeline/pipeline.model";
import {
	ALL_SWATCHES,
	SLOT_SWATCHES,
} from "~/modules/run/pipeline/swatch.model";
import { SwatchChips } from "./SwatchChips.ui";

describe(SwatchChips, () => {
	it("treats every chip as earned when no ownership is given", () => {
		render(<SwatchChips swatches={[SLOT_SWATCHES[4], SLOT_SWATCHES[5]]} />);
		expect(screen.getByText("Boulder Swatch")).toBeInTheDocument();
		expect(screen.getByText("Cascade Swatch")).toBeInTheDocument();
	});

	it("colors earned chips and leaves unearned ones unthemed", () => {
		const { container } = render(
			<SwatchChips
				swatches={[SLOT_SWATCHES[4], SLOT_SWATCHES[5]]}
				ownedIds={[SLOT_SWATCHES[4].id]}
			/>
		);
		expect(container.querySelectorAll("[data-swatch-theme]")).toHaveLength(1);
		expect(
			container.querySelector('[data-swatch-theme="boulder"]')
		).toBeInTheDocument();
	});

	it("redacts unearned names when asked, keeping earned ones readable", () => {
		render(
			<SwatchChips
				swatches={ALL_SWATCHES}
				ownedIds={[SLOT_SWATCHES[4].id]}
				redactLocked
			/>
		);
		expect(screen.getByText("Boulder Swatch")).toBeInTheDocument();
		expect(screen.queryByText("Cascade Swatch")).not.toBeInTheDocument();
		expect(screen.getAllByText("???")).toHaveLength(ALL_SWATCHES.length - 1);
	});

	it("rings the earned Elite Four chip instead of coloring it", () => {
		const eliteFour = SLOT_SWATCHES[MAX_SLOTS];
		const { container } = render(
			<SwatchChips swatches={[eliteFour]} ownedIds={[eliteFour.id]} />
		);
		expect(container.querySelector("[data-swatch-theme]")).toBeNull();
		expect(container.querySelectorAll(".legendary-ring").length).toBe(2); // chip border + dot
	});
});
