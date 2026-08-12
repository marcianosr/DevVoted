import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
	ALL_SWATCHES,
	GATE_SWATCHES,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";
import { SwatchChips } from "~/modules/run/gate/presentation/SwatchChips.ui";

const boulder = GATE_SWATCHES[1];
const cascade = GATE_SWATCHES[2];

describe(SwatchChips, () => {
	it("treats every chip as earned when no ownership is given", () => {
		render(<SwatchChips swatches={[boulder, cascade]} />);
		expect(screen.getByText("Boulder Swatch")).toBeInTheDocument();
		expect(screen.getByText("Cascade Swatch")).toBeInTheDocument();
	});

	it("colors earned chips and leaves unearned ones unthemed", () => {
		const { container } = render(
			<SwatchChips swatches={[boulder, cascade]} ownedIds={[boulder.id]} />
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
				ownedIds={[boulder.id]}
				redactLocked
			/>
		);
		expect(screen.getByText("Boulder Swatch")).toBeInTheDocument();
		expect(screen.queryByText("Cascade Swatch")).not.toBeInTheDocument();
		expect(screen.getAllByText("???")).toHaveLength(ALL_SWATCHES.length - 1);
	});

	it("keeps the Elite chip's indigo but rims it, so it does not vanish", () => {
		const elite = swatchForGate(VICTORY_GATE - 1)!;
		const { container } = render(
			<SwatchChips swatches={[elite]} ownedIds={[elite.id]} />
		);
		// Still themed — indigo is a real colour, just an unreadable text colour.
		expect(
			container.querySelector('[data-swatch-theme="elite"]')
		).toBeInTheDocument();
		expect(container.querySelector('[data-testid="swatch-mark"]')).toHaveClass(
			"ring-pewter"
		);
	});

	it("gives the earned Champion chip the gradient and no theme colour", () => {
		const champion = swatchForGate(VICTORY_GATE)!;
		const { container } = render(
			<SwatchChips swatches={[champion]} ownedIds={[champion.id]} />
		);
		expect(container.querySelector("[data-swatch-theme]")).toBeNull();
		expect(container.querySelectorAll(".legendary-ring")).toHaveLength(1); // the chip border
		expect(container.querySelector('[data-testid="swatch-mark"]')).toHaveClass(
			"bg-legendary"
		);
	});
});
