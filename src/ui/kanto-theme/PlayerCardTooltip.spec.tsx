import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PLAYER_CARD_TOOLTIP_ID } from "~/shared/hooks/usePlayerHover.hook";
import { kantoClimberCard } from "~/test/kantoCommunity.factory";

import { PlayerCardTooltip } from "./PlayerCardTooltip.ui";

const PLACEMENT = { left: 24, top: 120, width: 448, maxHeight: 400 };

describe("PlayerCardTooltip", () => {
	it("draws the card as a tooltip the face can point at", () => {
		render(
			<PlayerCardTooltip
				card={kantoClimberCard({ profileHref: undefined })}
				placement={PLACEMENT}
			/>
		);

		expect(screen.getByRole("tooltip")).toHaveAttribute(
			"id",
			PLAYER_CARD_TOOLTIP_ID
		);
	});

	it("stands where it was placed, fixed to the screen", () => {
		render(
			<PlayerCardTooltip
				card={kantoClimberCard({ profileHref: undefined })}
				placement={PLACEMENT}
			/>
		);

		const tooltip = screen.getByRole("tooltip");
		expect(tooltip).toHaveClass("fixed");
		expect(tooltip).toHaveStyle({ left: "24px", top: "120px", width: "448px" });
	});

	it("lets the pointer pass through, so it never steals the hover", () => {
		render(
			<PlayerCardTooltip
				card={kantoClimberCard({ profileHref: undefined })}
				placement={PLACEMENT}
			/>
		);

		expect(screen.getByRole("tooltip")).toHaveClass("pointer-events-none");
	});
});
