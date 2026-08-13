import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	AvatarRing,
	VoterAvatar,
} from "~/modules/run/community/presentation/Voter.ui";

const red = { id: "red", displayName: "Red", you: true };
const brock = { id: "brock", displayName: "Brock Boulder", you: false };

const ringOf = (container: HTMLElement): HTMLElement | null =>
	container.querySelector("span");

describe(AvatarRing, () => {
	it("rings you in cerulean so you stay findable in a stack", () => {
		const { container } = render(<AvatarRing player={red} />);
		expect(ringOf(container)).toHaveClass("ring-cerulean");
	});

	it("rings everyone else in the page colour, separating overlapping chips", () => {
		const { container } = render(<AvatarRing player={brock} />);
		expect(ringOf(container)).toHaveClass("ring-zinc-950");
	});

	it("keeps the browser's hover name when asked to be titled", () => {
		render(<AvatarRing player={brock} titled />);
		expect(screen.getByTitle("Brock Boulder")).toBeInTheDocument();
	});

	it("drops the hover name by default, leaving it to a wrapping tooltip", () => {
		// Both at once reads as a doubled name — the climb track is titled
		// because it carries no tooltip, the poll rows are not because they do.
		render(<AvatarRing player={brock} />);
		expect(screen.queryByTitle("Brock Boulder")).not.toBeInTheDocument();
	});

	it("takes focus only where a mobile tap must reveal the tooltip", () => {
		const { container } = render(<AvatarRing player={brock} focusable />);
		expect(ringOf(container)).toHaveAttribute("tabindex", "0");
	});

	it("stays out of the tab order otherwise", () => {
		const { container } = render(<AvatarRing player={brock} />);
		expect(ringOf(container)).not.toHaveAttribute("tabindex");
	});
});

describe(VoterAvatar, () => {
	it("draws an untitled ring, since VoterChip's tooltip carries the name", () => {
		const { container } = render(<VoterAvatar voter={red} />);
		expect(ringOf(container)).toHaveClass("ring-cerulean");
		expect(screen.queryByTitle("Red")).not.toBeInTheDocument();
	});
});
