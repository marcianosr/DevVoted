import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { dexConfigGroups } from "~/test/dexRegistry.factory";

import {
	DexConfigChip,
	infoLabelOf,
	leadLineOf,
	type DexConfigChipProps,
} from "./DexConfigChip.ui";

const [heavy, light] = dexConfigGroups;
const chipNamed = (name: string) => {
	const chip = [...heavy.chips, ...light.chips].find(
		(candidate) => candidate.state !== "locked" && candidate.name === name
	);
	if (chip === undefined) throw new Error(`no fixture chip named ${name}`);
	return chip;
};
const js = chipNamed(".js");
const eslint = chipNamed("ESLint");
const regressionTest = chipNamed("Regression Test");
const planningPoker = chipNamed("Planning Poker");
const locked = light.chips.find((chip) => chip.state === "locked");
if (locked === undefined) throw new Error("no locked fixture chip");

const chipOf = (container: HTMLElement): HTMLElement => {
	const chip = container.firstElementChild?.firstElementChild;
	if (!(chip instanceof HTMLElement)) throw new Error("no chip rendered");
	return chip;
};

const hintOf = (container: HTMLElement) =>
	container.firstElementChild?.lastElementChild;

describe("DexConfigChip", () => {
	describe("granted", () => {
		it("reads weight, name, version and figure in that order", () => {
			const { container } = render(<DexConfigChip {...js} />);

			expect(chipOf(container).textContent).toBe("1.jsv5×1.25i");
		});

		it("tags the ladder's ceiling, not the rung an install gives you", () => {
			const { container } = render(<DexConfigChip {...js} />);

			expect(within(chipOf(container)).getByText("v5")).toBeInTheDocument();
			expect(within(chipOf(container)).queryByText("v1")).toBeNull();
		});

		it("colours the figure as a gain", () => {
			const { container } = render(<DexConfigChip {...js} />);

			expect(within(chipOf(container)).getByText("×1.25")).toHaveAttribute(
				"data-screen-theme",
				"viridian"
			);
		});

		it("shows no version and no figure for a config that has neither", () => {
			const { container } = render(<DexConfigChip {...eslint} />);

			expect(chipOf(container).textContent).toBe("1ESLinti");
		});

		it("offers an i that names the config", () => {
			render(<DexConfigChip {...js} />);

			expect(screen.getByRole("button", { name: "About .js" })).toBeVisible();
		});

		it("leads the hint with the tag and the version, then states the effect", () => {
			render(<DexConfigChip {...js} infoOpen />);

			expect(screen.getByText("starter · v1 of 5")).toBeInTheDocument();
			expect(
				screen.getByText(
					(_, element) =>
						element?.textContent === "JavaScript polls reward ×1.25 coverage"
				)
			).toBeInTheDocument();
		});

		it("drops the version from the lead when there is no ladder", () => {
			render(<DexConfigChip {...eslint} infoOpen />);

			expect(screen.getByText("starter")).toBeInTheDocument();
		});

		it("adds how an earned config was earned, which a starter has no need of", () => {
			render(<DexConfigChip {...regressionTest} infoOpen />);
			expect(
				screen.getByText("Earned: answered 25 polls correctly")
			).toBeInTheDocument();

			render(<DexConfigChip {...js} infoOpen />);
			expect(screen.queryByText("Starter config")).not.toBeInTheDocument();
		});

		it("keeps the hint shut and hidden until it is pinned", () => {
			const { container, rerender } = render(<DexConfigChip {...js} />);
			const hint = () => hintOf(container);

			expect(hint()).toHaveAttribute("aria-hidden", "true");
			expect(screen.getByRole("button", { name: "About .js" })).toHaveAttribute(
				"aria-expanded",
				"false"
			);

			rerender(<DexConfigChip {...js} infoOpen />);

			expect(hint()).toHaveAttribute("aria-hidden", "false");
			expect(screen.getByRole("button", { name: "About .js" })).toHaveAttribute(
				"aria-expanded",
				"true"
			);
		});

		it("reports the press rather than opening on its own", async () => {
			const onToggleInfo = vi.fn();
			render(<DexConfigChip {...js} onToggleInfo={onToggleInfo} />);

			await userEvent.click(screen.getByRole("button", { name: "About .js" }));

			expect(onToggleInfo).toHaveBeenCalledOnce();
		});
	});

	describe("met", () => {
		it("names the config but dims it and withholds the effect", () => {
			const { container } = render(<DexConfigChip {...planningPoker} />);

			expect(screen.getByText("Planning Poker")).toHaveClass(
				"text-theme-muted"
			);
			expect(chipOf(container)).toHaveClass("opacity-60");
			expect(screen.getByText("???")).toBeInTheDocument();
			expect(screen.queryByRole("img")).not.toBeInTheDocument();
		});

		it("offers the unlock paths behind its i", () => {
			render(<DexConfigChip {...planningPoker} infoOpen />);

			expect(
				screen.getByRole("button", { name: "how to unlock Planning Poker" })
			).toBeVisible();
			expect(
				screen.getByText("unlock · Land 3 exact estimates")
			).toBeInTheDocument();
		});
	});

	describe("locked", () => {
		it("shows only the weight, the name redacted and the effect gone", () => {
			const { container } = render(<DexConfigChip {...locked} />);

			expect(screen.getByText("1")).toBeInTheDocument();
			expect(screen.getByText("???")).toBeInTheDocument();
			expect(chipOf(container).textContent).toBe("1???i");
		});

		it("wears a dashed edge, an empty socket in the checklist", () => {
			const { container } = render(<DexConfigChip {...locked} />);

			expect(chipOf(container)).toHaveClass("border-dashed");
		});

		it("names itself locked on the i, the one thing a reader can reach", () => {
			render(<DexConfigChip {...locked} />);

			expect(
				screen.getByRole("button", { name: "Locked config · how to unlock" })
			).toBeVisible();
		});

		it("names the required path and counts the progress against it", () => {
			render(<DexConfigChip {...locked} infoOpen />);

			const path = screen.getByText("4/10").parentElement;

			expect(path).toHaveTextContent("unlock · Answer 10 HTML polls correctly");
			expect(screen.getByText("HTML")).toHaveClass("badge-theme");
		});

		it("draws every further path as an alternative that names itself to a reader", () => {
			render(<DexConfigChip {...locked} infoOpen />);

			expect(screen.getByText("or · Answer 25 polls")).toHaveClass("sr-only");
			expect(screen.getByText("43/25")).toBeInTheDocument();
		});

		it("drops the count from a one-shot objective, which has none", () => {
			const oneShot: DexConfigChipProps = {
				id: "agents",
				slots: 8,
				state: "locked",
				paths: [
					{ text: "Clear a gate with every slot filled", progress: null },
				],
			};
			render(<DexConfigChip {...oneShot} infoOpen />);

			expect(
				screen.getByText("unlock · Clear a gate with every slot filled")
			).toBeInTheDocument();
			expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
		});
	});

	describe("labels", () => {
		it("names the rung an install gives you, which the chip's tag does not", () => {
			expect(leadLineOf({ starter: false })).toBe("earned");
			expect(leadLineOf({ starter: true, maxVersion: 2 })).toBe(
				"starter · v1 of 2"
			);
		});

		it("names what the i opens for each state", () => {
			expect(infoLabelOf(js)).toBe("About .js");
			expect(infoLabelOf(planningPoker)).toBe("how to unlock Planning Poker");
			expect(infoLabelOf(locked)).toBe("Locked config · how to unlock");
		});
	});
});
