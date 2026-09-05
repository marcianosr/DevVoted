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
	it("hangs each unlock on the gate whose clear actually opens it", () => {
		renderLadder(0);

		expect(row("2 Cascade").getByText("extend")).toBeInTheDocument();
	});

	it("hangs no lock on any gate — that action ships with yarn.lock", () => {
		renderLadder(12);

		expect(screen.queryByText("lock")).toBeNull();
	});

	it("says git tag, the word the shop sells a pin under", () => {
		renderLadder(3);

		expect(row("3 Thunder").getByText("git tag")).toBeInTheDocument();
	});

	it("promises no width, because slots are bought and never handed over", () => {
		renderLadder(12);

		expect(screen.queryByText(/\d+ slots?$/)).toBeNull();
		expect(screen.queryByText(/MB/)).toBeNull();
	});

	it("keeps naming the shop actions, which the shop advertises anyway", () => {
		renderLadder(0);

		expect(row("3 Thunder").getByText("git tag")).toBeInTheDocument();
	});

	it("withholds the rules of a gate nobody has stood in front of", () => {
		renderLadder(0);

		expect(row("3 Thunder").queryByText("402 Payment Required")).toBeNull();
		expect(redactionsIn("3 Thunder")).toHaveLength(1);
	});

	it("counts each withheld chip, so an empty gate still reads as empty", () => {
		renderLadder(0);

		expect(redactionsIn("2 Cascade")).toHaveLength(0);
		expect(redactionsIn("3 Thunder")).toHaveLength(1);
	});

	it("keeps naming an audit already met in an earlier band", () => {
		renderLadder(9);

		expect(
			row("12 Champion").getByText("408 Request Timeout")
		).toBeInTheDocument();
	});

	it("names everything once the ladder is finished", () => {
		renderLadder(12);

		expect(screen.queryAllByText("???")).toHaveLength(0);
	});

	it("names the audits a gate is certain to carry", () => {
		renderLadder(12);

		expect(row("11 Elite").getByText("410 Gone")).toBeInTheDocument();
		expect(
			row("12 Champion").getByText("408 Request Timeout")
		).toBeInTheDocument();
	});

	it("states a drawn gate's shape without naming what it will draw", () => {
		renderLadder(12);

		expect(row("8 Seafoam").getByText(/draws 2 of/)).toBeInTheDocument();
		expect(row("4 Lavender").getByText(/draws 1 of/)).toBeInTheDocument();
		expect(row("12 Champion").queryByText(/draws/)).toBeNull();
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
