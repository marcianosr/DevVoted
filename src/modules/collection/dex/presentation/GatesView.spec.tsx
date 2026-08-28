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

		expect(row("1 Boulder").getByText("lock")).toBeInTheDocument();
		expect(row("1 Boulder").getByText("8 spots")).toBeInTheDocument();
	});

	it("says git tag, the word the shop sells a pin under", () => {
		renderLadder(3);

		expect(row("3 Thunder").getByText("git tag")).toBeInTheDocument();
	});

	it("names the width a clear hands over, in spots", () => {
		renderLadder(12);

		expect(row("4 Lavender").getByText("12 spots")).toBeInTheDocument();
		expect(row("10 Earth").getByText("24 spots")).toBeInTheDocument();
		expect(screen.queryByText(/spot plan/)).toBeNull();
		expect(screen.queryByText(/MB/)).toBeNull();
	});

	it("claims no gate for the width every run opens with", () => {
		renderLadder(12);

		expect(screen.queryByText("4 spots")).not.toBeInTheDocument();
	});

	it("withholds the width a locked gate hands over", () => {
		renderLadder(0);

		expect(row("4 Lavender").queryByText("12 spots")).not.toBeInTheDocument();
	});

	it("keeps naming the shop actions, which the shop advertises anyway", () => {
		renderLadder(0);

		expect(row("3 Thunder").getByText("git tag")).toBeInTheDocument();
	});

	it("withholds the rules of a gate nobody has stood in front of", () => {
		renderLadder(0);

		expect(row("4 Lavender").queryByText("Dependency Outage")).toBeNull();
		expect(redactionsIn("4 Lavender")).toHaveLength(2);
	});

	it("counts each withheld chip, so an empty gate still reads as empty", () => {
		renderLadder(0);

		expect(redactionsIn("2 Cascade")).toHaveLength(0);
		expect(redactionsIn("3 Thunder")).toHaveLength(1);
	});

	it("keeps naming an audit already met at an earlier gate", () => {
		renderLadder(7);

		expect(row("11 Elite").getByText("Mirror")).toBeInTheDocument();
		expect(row("11 Elite").getByText("Flaky Build")).toBeInTheDocument();
		expect(redactionsIn("11 Elite")).toHaveLength(1);
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
