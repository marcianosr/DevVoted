import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	ConfigUnlock,
	alternativeLabelOf,
	progressLabelOf,
	unlockLabelOf,
	type ConfigUnlockPath,
} from "./ConfigUnlock.ui";

const REQUIRED: ConfigUnlockPath = {
	text: "Answer 10 HTML polls correctly",
	progress: { count: 4, target: 10 },
};

const FALLBACK: ConfigUnlockPath = {
	text: "Answer 25 polls",
	progress: { count: 43, target: 25 },
};

const ONE_SHOT: ConfigUnlockPath = {
	text: "Clear a gate with every slot filled",
	progress: null,
};

describe("ConfigUnlock", () => {
	it("names the required path and counts the progress against it", () => {
		render(<ConfigUnlock paths={[REQUIRED, FALLBACK]} />);

		const path = screen.getByText("4/10").parentElement;

		expect(path).toHaveTextContent("unlock · Answer 10 HTML polls correctly");
	});

	it("badges a category named in a path, the same as anywhere else", () => {
		render(<ConfigUnlock paths={[REQUIRED]} />);

		expect(screen.getByText("HTML")).toHaveClass("badge-theme");
	});

	it("draws every further path as an alternative that names itself to a reader", () => {
		render(<ConfigUnlock paths={[REQUIRED, FALLBACK]} />);

		expect(screen.getByText("or · Answer 25 polls")).toHaveClass("sr-only");
		expect(screen.getByText("43/25")).toBeInTheDocument();
	});

	it("draws an uncounted alternative as prose, having no bar to fill", () => {
		render(<ConfigUnlock paths={[REQUIRED, ONE_SHOT]} />);

		expect(
			screen.getByText("or · Clear a gate with every slot filled")
		).not.toHaveClass("sr-only");
	});

	it("drops the count from a one-shot objective, which has none", () => {
		render(<ConfigUnlock paths={[ONE_SHOT]} />);

		expect(
			screen.getByText("unlock · Clear a gate with every slot filled")
		).toBeInTheDocument();
		expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
	});

	it("leads the first path with the verb and the rest with the alternative", () => {
		expect(unlockLabelOf(REQUIRED)).toBe(
			"unlock · Answer 10 HTML polls correctly"
		);
		expect(alternativeLabelOf(FALLBACK)).toBe("or · Answer 25 polls");
	});

	it("counts progress against its target rather than as a percentage", () => {
		expect(progressLabelOf({ count: 4, target: 10 })).toBe("4/10");
	});
});
