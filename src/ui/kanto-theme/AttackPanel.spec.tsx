import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	ATTACK_DEALING,
	ATTACK_NO_RIVAL,
	ATTACK_UNARMED,
	kantoAttackPanel,
	kantoAttackPanelDealing,
	kantoAttackPanelHealthy,
	kantoAttackPanelInspected,
	kantoAttackPanelNoRival,
	kantoAttackPanelUnarmed,
} from "~/test/kantoIncidents.factory";

import { AttackPanel } from "./AttackPanel.ui";

const BROCK_RUN_ID = 3;

const openAt = (runId: number) => ({
	...kantoAttackPanel(),
	openRunId: runId,
});

const chipFor = (name: string) =>
	screen.getByText(name).closest("span.inline-flex");

describe("AttackPanel", () => {
	it("names the title each rival wears, since their build is open anyway", () => {
		render(<AttackPanel {...kantoAttackPanel()} />);

		expect(screen.getByText("CSS Maintainer")).toBeInTheDocument();
		expect(screen.getByText("Summit")).toBeInTheDocument();
	});

	it("lists a rival who wears no title beside the ones who do", () => {
		render(<AttackPanel {...kantoAttackPanel()} />);

		expect(screen.getByText("Misty")).toBeInTheDocument();
		expect(screen.getByText("Brock")).toBeInTheDocument();
		expect(screen.getByText("Erika")).toBeInTheDocument();
	});

	it("presses only to inspect until a rival is opened", () => {
		render(<AttackPanel {...kantoAttackPanel()} />);

		expect(screen.getAllByRole("button")).toHaveLength(3);
		expect(
			screen.queryByRole("button", { name: "Fire 404 at Misty" })
		).not.toBeInTheDocument();
	});

	it("offers both rolled payloads once a PERFECT close's rival is open", () => {
		render(<AttackPanel {...kantoAttackPanelInspected()} />);

		expect(screen.getByText("choose 1 of 2 payloads")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Fire 404 at Misty" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Fire 507 at Misty" })
		).toBeInTheDocument();
	});

	it("offers the one payload a HEALTHY close rolled", () => {
		render(
			<AttackPanel {...kantoAttackPanelHealthy()} openRunId={BROCK_RUN_ID} />
		);

		expect(screen.getByText("1 payload")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Fire 408 at Brock" })
		).toBeInTheDocument();
	});

	it("marks the opened rival's press as expanded, and the others not", () => {
		render(<AttackPanel {...kantoAttackPanelInspected()} />);

		expect(screen.getByRole("button", { name: "close Misty" })).toHaveAttribute(
			"aria-expanded",
			"true"
		);
		expect(
			screen.getByRole("button", { name: "inspect Brock" })
		).toHaveAttribute("aria-expanded", "false");
	});

	it("asks to open the rival whose press was hit", async () => {
		const onInspect = vi.fn();
		render(<AttackPanel {...kantoAttackPanel()} onInspect={onInspect} />);

		await userEvent.click(
			screen.getByRole("button", { name: "inspect Brock" })
		);

		expect(onInspect).toHaveBeenCalledWith(BROCK_RUN_ID);
	});

	it("names the gate each attack lands on", () => {
		render(<AttackPanel {...kantoAttackPanel()} />);

		expect(screen.getByText("gate 7 · Marsh")).toBeInTheDocument();
		expect(screen.getByText("gate 9 · Volcano")).toBeInTheDocument();
	});

	it("states what a build costs to run, the one figure ADR-101 makes public", () => {
		render(<AttackPanel {...kantoAttackPanel()} />);

		expect(screen.getByText("5 weight")).toBeInTheDocument();
		expect(screen.getByText("3 weight")).toBeInTheDocument();
		expect(screen.getByText("0 weight")).toBeInTheDocument();
	});

	it("fires the press's own pair", async () => {
		const onPress = vi.fn();
		const props = openAt(BROCK_RUN_ID);
		render(
			<AttackPanel
				{...props}
				rivals={props.rivals.map((rival) => ({
					...rival,
					payloads: rival.payloads.map((payload) => ({
						...payload,
						onPress: () => onPress(rival.targetRunId, payload.auditId),
					})),
				}))}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Fire 408 at Brock" })
		);

		expect(onPress).toHaveBeenCalledWith(BROCK_RUN_ID, "timeout");
	});

	it("teaches how an audit is earned while nothing is armed", () => {
		const { container } = render(
			<AttackPanel {...kantoAttackPanelUnarmed()} />
		);

		expect(container.textContent).toContain(ATTACK_UNARMED);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("badges the band it asks for rather than leaving it in the prose", () => {
		render(<AttackPanel {...kantoAttackPanelUnarmed()} />);

		expect(screen.getByText("HEALTHY")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("says why an armed audit has nobody to aim at", () => {
		const { container } = render(
			<AttackPanel {...kantoAttackPanelNoRival()} />
		);

		expect(container.textContent).toContain(ATTACK_NO_RIVAL);
	});

	it("says it is still dealing rather than showing an empty field", () => {
		render(<AttackPanel {...kantoAttackPanelDealing()} />);

		expect(screen.getByText(ATTACK_DEALING)).toBeInTheDocument();
	});

	it("shows each rival's build under their name", () => {
		render(<AttackPanel {...kantoAttackPanel()} />);

		expect(screen.getByText(".ts")).toBeInTheDocument();
		expect(screen.getByText("Cache")).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
		expect(screen.getByText("Telemetry")).toBeInTheDocument();
	});

	it("marks the config a rival has vendor-locked", () => {
		render(<AttackPanel {...kantoAttackPanel()} />);

		expect(screen.getByText("locked in")).toBeInTheDocument();
	});

	it("adds no press for a rival's config", () => {
		render(<AttackPanel {...kantoAttackPanelInspected()} />);

		expect(
			screen.queryByRole("button", { name: /About/ })
		).not.toBeInTheDocument();
	});

	it("says when a rival has nothing installed", () => {
		render(<AttackPanel {...kantoAttackPanel()} />);

		expect(screen.getByText("nothing installed")).toBeInTheDocument();
	});

	describe("the config a payload names", () => {
		it("badges it on the payload and lights it in the build", () => {
			render(<AttackPanel {...openAt(BROCK_RUN_ID)} />);

			expect(screen.getByText("hits ESLint")).toBeInTheDocument();
			expect(chipFor("ESLint")).toHaveClass("border-theme");
		});

		it("leaves the build unlit while the rival is shut", () => {
			render(<AttackPanel {...kantoAttackPanel()} />);

			expect(chipFor("ESLint")).not.toHaveClass("border-theme");
		});
	});
});
