import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { dexConfigsProps } from "~/test/dexRegistry.factory";

import { DexConfigs } from "./DexConfigs.ui";

describe("DexConfigs", () => {
	it("names the collection and counts the deck against the roster", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByRole("heading", { name: "configs" })).toBeVisible();
		expect(screen.getByText("18 of 44")).toBeVisible();
	});

	it("shows a granted config's name and weight", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByText(".js")).toBeVisible();
		expect(screen.getByText("1")).toBeVisible();
	});

	it("tags a starter apart from a config that was earned", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByText("starter")).toBeVisible();
		expect(screen.getByText("earned")).toBeVisible();
	});

	it("keeps the provenance sentence behind the tag that stands for it", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByText("Earned: sweep three gates")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Cache provenance" })
		).toHaveTextContent("earned");
	});

	it("badges the figures in an effect so the numbers read at a glance", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByText("+0.25")).toBeVisible();
	});

	it("withholds a locked config's name entirely, not just its effect", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByText("Locked config")).toBeInTheDocument();
		expect(screen.queryByText("AGENTS.md")).not.toBeInTheDocument();
	});

	it("names the required unlock path and counts the progress against it", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByText("unlock · Hold 2 MB in the archive")).toBeVisible();
		expect(screen.getByText("1/2")).toBeVisible();
	});

	it("draws every further path as an alternative, with its own count", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByText("43/225")).toBeVisible();
	});

	it("names an alternative path to a reader, which the bar cannot", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByText("or · Answer 225 polls")).toBeInTheDocument();
	});

	it("lays a version ladder out as one pressable rung each", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByRole("button", { name: "Read .js v1" })).toBeVisible();
		expect(screen.getByRole("button", { name: "Read .js v2" })).toBeVisible();
		expect(screen.getByRole("button", { name: "Read .js v3" })).toBeVisible();
	});

	it("opens a ladder on v1, which is what installing already gives you", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByRole("button", { name: "Read .js v1" })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
		expect(screen.getByText("on install")).toBeVisible();
		expect(screen.getByText("×1.25")).toBeVisible();
	});

	it("reports which rung was pressed rather than moving on its own", async () => {
		const onVersion = vi.fn();
		render(<DexConfigs {...dexConfigsProps({ onVersion })} />);

		await userEvent.click(screen.getByRole("button", { name: "Read .js v2" }));

		expect(onVersion).toHaveBeenCalledWith("js", 2);
	});

	it("reads the selected rung's effect and what the step costs", () => {
		render(<DexConfigs {...dexConfigsProps({ selected: { js: 3 } })} />);

		expect(screen.getByText("×1.75")).toBeVisible();
		expect(screen.queryByText("×1.25")).not.toBeInTheDocument();
		expect(screen.getByText("96 KB")).toBeVisible();
		expect(screen.queryByText("on install")).not.toBeInTheDocument();
	});

	it("states how often the registry rolls the rung being read", () => {
		render(<DexConfigs {...dexConfigsProps({ selected: { js: 3 } })} />);

		expect(screen.getByText("1 in 4 rolls")).toBeVisible();
	});

	it("quotes no odds for v1, which is never rolled", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.queryByText(/rolls/)).not.toBeInTheDocument();
	});

	it("marks only the rung being read, so the ladder reads as one choice", () => {
		render(<DexConfigs {...dexConfigsProps({ selected: { js: 3 } })} />);

		expect(screen.getByRole("button", { name: "Read .js v3" })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
		expect(screen.getByRole("button", { name: "Read .js v1" })).toHaveAttribute(
			"aria-pressed",
			"false"
		);
	});

	it("leaves a config with no ladder unmarked and unpriced", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.queryByRole("button", { name: /Read Cache/ })).toBeNull();
		expect(screen.queryByText("64 KB")).not.toBeInTheDocument();
	});

	it("drops the count from a one-shot objective, which has none", () => {
		render(
			<DexConfigs
				{...dexConfigsProps({
					rows: [
						{
							id: "yarn",
							slots: 2,
							state: "locked",
							paths: [{ text: "Clear gate 6", progress: null }],
						},
					],
				})}
			/>
		);

		expect(screen.getByText("unlock · Clear gate 6")).toBeVisible();
	});
});
