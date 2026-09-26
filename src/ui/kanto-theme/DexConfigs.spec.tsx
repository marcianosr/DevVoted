import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { dexConfigsProps } from "~/test/dexRegistry.factory";

import { DexConfigs } from "./DexConfigs.ui";

const groupHeaded = (label: string) => {
	const section = screen.getByText(label).parentElement?.parentElement;
	if (!(section instanceof HTMLElement))
		throw new Error(`no weight group headed ${label}`);

	return section;
};

describe("DexConfigs", () => {
	it("names the collection and counts the deck against the roster", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByRole("heading", { name: "configs" })).toBeVisible();
		expect(screen.getByText("18 of 44")).toBeVisible();
	});

	it("heads each weight with its block, the weight named and how much you hold", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByText("weight 2")).toBeVisible();
		expect(screen.getByText("3 of 5")).toBeVisible();
		expect(screen.getByText("weight 1")).toBeVisible();
		expect(screen.getByText("2 of 3")).toBeVisible();
	});

	it("leads the heading with the weight block, so its length reads as the rung", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		const heading = screen.getByText("weight 2").parentElement;

		expect(heading?.firstElementChild).toHaveTextContent("2");
	});

	it("lays the groups out in the order given, heaviest first", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		const heavy = screen.getByText("weight 2");
		const light = screen.getByText("weight 1");

		expect(
			heavy.compareDocumentPosition(light) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it("seats every card under its own weight", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(groupHeaded("weight 2")).toHaveTextContent("Code Coverage");
		expect(groupHeaded("weight 2")).not.toHaveTextContent(".js");
		expect(groupHeaded("weight 1")).toHaveTextContent(".js");
	});

	it("draws granted, met and locked cards side by side in one group", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByText("Regression Test")).toBeVisible();
		expect(screen.getByText("Planning Poker")).toBeVisible();
		expect(screen.getAllByText("???")).toHaveLength(2);
	});

	it("arrives with every card collapsed, the tab being a list to scan", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByRole("button", { name: "Expand .js" })).toHaveAttribute(
			"aria-expanded",
			"false"
		);
		expect(screen.queryByText(/polls reward/)).not.toBeInTheDocument();
	});

	it("opens exactly the card named as open", () => {
		render(<DexConfigs {...dexConfigsProps({ openInfo: new Set(["js"]) })} />);

		expect(
			screen.getByRole("button", { name: "Collapse .js" })
		).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByRole("button", { name: "Expand ESLint" })
		).toHaveAttribute("aria-expanded", "false");
	});

	it("states an open config's effect on the card rather than over it", () => {
		render(<DexConfigs {...dexConfigsProps({ openInfo: new Set(["js"]) })} />);

		expect(screen.getByText(/polls reward/)).toBeVisible();
		expect(screen.getByText("Starter config · v1 of 5")).toBeVisible();
	});

	it("states a locked config's unlock paths once its card is opened", () => {
		render(
			<DexConfigs {...dexConfigsProps({ openInfo: new Set(["lock"]) })} />
		);

		expect(screen.getByText("unlock · Lock 5 shop offers")).toBeVisible();
		expect(screen.getByText("2/5")).toBeVisible();
	});

	it("reports which card was pressed rather than opening on its own", async () => {
		const onToggleInfo = vi.fn();
		render(<DexConfigs {...dexConfigsProps({ onToggleInfo })} />);

		await userEvent.click(screen.getByRole("button", { name: "Expand .js" }));

		expect(onToggleInfo).toHaveBeenCalledWith("js");
	});

	it("offers one press to open every card in the tab", async () => {
		const onToggleAll = vi.fn();
		render(<DexConfigs {...dexConfigsProps({ onToggleAll })} />);

		await userEvent.click(screen.getByRole("button", { name: "expand all" }));

		expect(onToggleAll).toHaveBeenCalledTimes(1);
	});

	it("names the press for the move it is about to make", () => {
		const open = new Set(
			dexConfigsProps().groups.flatMap((group) =>
				group.chips.map((card) => card.id)
			)
		);
		render(<DexConfigs {...dexConfigsProps({ openInfo: open })} />);

		expect(screen.getByRole("button", { name: "collapse all" })).toBeVisible();
	});

	it("states the collection's rule in the footer", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(
			screen.getByText(
				"Configs in the deck can be dealt into a hand or offered in the shop."
			)
		).toBeVisible();
	});
});
