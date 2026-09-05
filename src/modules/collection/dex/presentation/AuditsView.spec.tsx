import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { auditdex } from "~/modules/collection/dex/domain/auditdex.model";
import { gatedex } from "~/modules/collection/dex/domain/gatedex.model";
import { AuditsView } from "~/modules/collection/dex/presentation/AuditsView.component";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

const renderRoster = (
	clearedThrough: number,
	runs: readonly { gatesCleared: number; finished: boolean }[] = []
) =>
	render(
		<AuditsView
			audits={auditdex(
				gatedex(
					ALL_SWATCHES.filter((swatch) => swatch.gate <= clearedThrough).map(
						(swatch) => swatch.id
					)
				),
				runs
			)}
		/>
	);

describe("AuditsView", () => {
	it("names an audit whose gate has fallen, and says it was faced", () => {
		renderRoster(3);

		expect(screen.getByText("402 Payment Required")).toBeInTheDocument();
		expect(screen.getByText("faced")).toBeInTheDocument();
	});

	it("names the next gate's audit without calling it faced", () => {
		renderRoster(3);

		expect(screen.getByText("424 Failed Dependency")).toBeInTheDocument();
		expect(screen.getAllByText("faced")).toHaveLength(1);
	});

	it("hands over no name at all for an audit past the reachable pools", () => {
		renderRoster(3);

		expect(screen.queryByText("403 Forbidden")).not.toBeInTheDocument();
	});

	it("redacts the whole roster before a single gate has fallen", () => {
		renderRoster(-1);

		expect(screen.queryByText("402 Payment Required")).not.toBeInTheDocument();
	});

	it("quotes how many climbs beat an audit out of the climbs that faced it", () => {
		renderRoster(3, [
			{ gatesCleared: 3, finished: true },
			{ gatesCleared: 4, finished: true },
		]);

		expect(screen.getByText("beaten 1 of 2")).toBeInTheDocument();
	});

	// The tally is the more useful reading of the same fact, so it replaces the
	// bare "faced" rather than sitting next to it.
	it("drops the bare faced chip once a tally can be quoted", () => {
		renderRoster(3, [{ gatesCleared: 4, finished: true }]);

		expect(screen.queryByText("faced")).not.toBeInTheDocument();
	});

	it("says nothing about an audit no climb has reached", () => {
		renderRoster(3, [{ gatesCleared: 4, finished: true }]);

		expect(screen.queryByText(/beaten 0 of 0/)).not.toBeInTheDocument();
	});

	it("states a gate's rule where the gate is one you have reached", () => {
		renderRoster(3);

		expect(screen.getByText(/Every paid action costs ×2/)).toBeInTheDocument();
	});
});
