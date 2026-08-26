import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { auditdex } from "~/modules/collection/dex/domain/auditdex.model";
import { gatedex } from "~/modules/collection/dex/domain/gatedex.model";
import { GatesView } from "~/modules/collection/dex/presentation/GatesView.component";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

const renderLadder = (clearedThrough = -1) => {
	const gates = gatedex(
		ALL_SWATCHES.filter((swatch) => swatch.gate <= clearedThrough).map(
			(swatch) => swatch.id
		)
	);

	return render(<GatesView gates={gates} audits={auditdex(gates)} />);
};

const row = (label: string) => {
	const gateRow = screen.getByText(label).closest("li");
	if (!gateRow) throw new Error(`no gate row for ${label}`);
	return within(gateRow);
};

const redactionsIn = (label: string) => row(label).queryAllByText("???");

describe("GatesView", () => {
	it("hangs each grant on the gate whose clear actually opens it", () => {
		renderLadder(0);

		// LOCK_FROM_GATE is 2 and STORAGE_PLANS puts 768 KB at fromGate 2, but
		// both are gatesCleared floors: gate 1 is the one you clear for them.
		expect(row("1 Boulder").getByText("slot 4")).toBeInTheDocument();
		expect(row("1 Boulder").getByText("lock")).toBeInTheDocument();
		expect(row("1 Boulder").getByText("768 KB plan")).toBeInTheDocument();
	});

	it("says git tag, the word the shop sells a pin under", () => {
		renderLadder(3);

		expect(row("3 Thunder").getByText("git tag")).toBeInTheDocument();
	});

	it("crosses out of KB where the storage ladder does", () => {
		renderLadder(3);

		expect(row("3 Thunder").getByText("1 MB plan")).toBeInTheDocument();
	});

	it("claims no gate for the plans the first shop already sells", () => {
		renderLadder(12);

		expect(screen.queryByText("640 KB plan")).not.toBeInTheDocument();
		expect(screen.queryByText("512 KB plan")).not.toBeInTheDocument();
	});

	it("withholds the width and storage a locked gate opens", () => {
		renderLadder(0);

		expect(row("3 Thunder").queryByText("slot 5")).not.toBeInTheDocument();
		expect(row("3 Thunder").queryByText("1 MB plan")).not.toBeInTheDocument();
	});

	it("keeps naming the shop actions, which the shop advertises anyway", () => {
		renderLadder(0);

		expect(row("3 Thunder").getByText("git tag")).toBeInTheDocument();
	});

	it("withholds the rules of a gate nobody has stood in front of", () => {
		renderLadder(0);

		expect(row("4 Lavender").queryByText("Dependency Outage")).toBeNull();
		expect(redactionsIn("4 Lavender")).toHaveLength(1);
	});

	it("counts each withheld chip, so an empty gate still reads as empty", () => {
		renderLadder(0);

		// Cascade opens extend and carries no audit: nothing to redact.
		expect(redactionsIn("2 Cascade")).toHaveLength(0);
		// Thunder withholds Cost Overrun, slot 5 and the 1 MB plan.
		expect(redactionsIn("3 Thunder")).toHaveLength(3);
	});

	it("keeps naming an audit already met at an earlier gate", () => {
		// Mirror sits on gates 7 and 11; clearing 7 is what makes it readable,
		// and gate 11 being locked must not take the name back.
		renderLadder(7);

		expect(row("11 Elite").getByText("Mirror")).toBeInTheDocument();
		expect(row("11 Elite").getByText("Flaky Build")).toBeInTheDocument();
		// Strip is still unseen, and slot 11 is behind a locked gate.
		expect(redactionsIn("11 Elite")).toHaveLength(2);
	});

	it("names everything once the ladder is finished", () => {
		renderLadder(12);

		expect(screen.queryAllByText("???")).toHaveLength(0);
	});

	it("names the audits a gate carries", () => {
		renderLadder(12);

		expect(row("8 Seafoam").getByText("Timeout")).toBeInTheDocument();
		expect(row("8 Seafoam").getByText("Flaky Build")).toBeInTheDocument();
	});

	it("marks the cleared gates and the one in front of them", () => {
		renderLadder(1);

		expect(row("0 Pallet").getByText("cleared")).toBeInTheDocument();
		expect(row("2 Cascade").getByText("next")).toBeInTheDocument();
	});

	it("says which gate ends the run", () => {
		renderLadder();

		expect(row("12 Champion").getByText("wins the run")).toBeInTheDocument();
	});
});
