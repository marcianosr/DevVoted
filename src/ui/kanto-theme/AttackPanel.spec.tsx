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
	kantoAttackPanelNoRival,
	kantoAttackPanelUnarmed,
} from "~/test/kantoIncidents.factory";

import { AttackPanel } from "./AttackPanel.ui";

describe("AttackPanel", () => {
	it("offers two presses per rival after a PERFECT close", () => {
		render(<AttackPanel {...kantoAttackPanel()} />);

		expect(screen.getByText("choose 1 of 2 payloads")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Fire 404 at Misty" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Fire 507 at Misty" })
		).toBeInTheDocument();
		expect(screen.getAllByRole("button")).toHaveLength(6);
	});

	it("offers one press per rival after a HEALTHY close", () => {
		render(<AttackPanel {...kantoAttackPanelHealthy()} />);

		expect(screen.getByText("1 payload")).toBeInTheDocument();
		expect(screen.getAllByRole("button")).toHaveLength(3);
	});

	it("names the gate each attack lands on", () => {
		render(<AttackPanel {...kantoAttackPanel()} />);

		expect(screen.getByText("gate 7 · Marsh")).toBeInTheDocument();
		expect(screen.getByText("gate 9 · Volcano")).toBeInTheDocument();
	});

	it("fires the press's own pair", async () => {
		const onPress = vi.fn();
		const props = kantoAttackPanel();
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

		expect(onPress).toHaveBeenCalledWith(3, "timeout");
	});

	it("teaches how an attack is earned while nothing is armed", () => {
		render(<AttackPanel {...kantoAttackPanelUnarmed()} />);

		expect(screen.getByText(ATTACK_UNARMED)).toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("says why an armed attack has nobody to aim at", () => {
		render(<AttackPanel {...kantoAttackPanelNoRival()} />);

		expect(screen.getByText(ATTACK_NO_RIVAL)).toBeInTheDocument();
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
		render(<AttackPanel {...kantoAttackPanel()} />);

		expect(screen.getAllByRole("button")).toHaveLength(6);
	});

	it("says when a rival has nothing installed", () => {
		render(<AttackPanel {...kantoAttackPanel()} />);

		expect(screen.getByText("nothing installed")).toBeInTheDocument();
	});
});
