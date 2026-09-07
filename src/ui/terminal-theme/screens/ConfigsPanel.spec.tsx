import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
	ConfigsPanel,
	type ConfigsPanelProps,
	type DexConfig,
} from "./ConfigsPanel.ui";

const dealt: DexConfig = {
	id: "overclock",
	slots: 4,
	unlock: {
		state: "unlocked",
		provenance: "Earned: closed a perfect window at gate 3 or deeper",
	},
	label: "overclock",
	best: 4,
	maxVersion: 5,
	installs: 28,
	firstSeenGate: 7,
	effect: "×2 coverage while the window holds",
};

const unearned: DexConfig = {
	id: "wtfpl",
	slots: 4,
	seen: false,
	unlock: {
		state: "locked",
		thematic: {
			kind: "one-shot",
			text: "Sell 3 configs in a single shop",
			done: false,
		},
		fallback: {
			kind: "counted",
			text: "Answer 450 polls",
			count: 412,
			target: 450,
		},
	},
};

const neverDealt: DexConfig = {
	id: "rb",
	slots: 4,
	seen: false,
	unlock: { state: "unlocked", provenance: "Earned: answered 275 polls" },
};

const base: ConfigsPanelProps = {
	configs: [dealt, unearned, neverDealt],
	view: "slots",
	onView: () => {},
	onSelect: () => {},
};

describe(ConfigsPanel, () => {
	it("names the path that earned a config once you pick it", () => {
		render(<ConfigsPanel {...base} selectedId="overclock" />);

		expect(
			screen.getByText("Earned: closed a perfect window at gate 3 or deeper")
		).toBeInTheDocument();
	});

	it("offers both paths to a config the account has not earned", () => {
		const { container } = render(<ConfigsPanel {...base} />);

		expect(container.textContent).toContain("Sell 3 configs in a single shop");
		expect(container.textContent).toContain("or Answer 450 polls · 412/450");
	});

	it("says how an unlocked config was come by while it is still undealt", () => {
		render(<ConfigsPanel {...base} />);

		expect(screen.getByText("Earned: answered 275 polls")).toBeInTheDocument();
	});

	it("redacts every undealt config, earned or not", () => {
		render(<ConfigsPanel {...base} />);

		expect(screen.getAllByText("???")).toHaveLength(2);
	});

	it("keeps the unlock paths on the unseen view", () => {
		const { container } = render(<ConfigsPanel {...base} view="unseen" />);

		expect(container.textContent).toContain("or Answer 450 polls · 412/450");
		expect(container.textContent).not.toContain("overclock");
	});
});
