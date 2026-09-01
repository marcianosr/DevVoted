import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { auditdex } from "~/modules/collection/dex/domain/auditdex.model";
import { gatedex } from "~/modules/collection/dex/domain/gatedex.model";
import { AuditsView } from "~/modules/collection/dex/presentation/AuditsView.component";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

const renderRoster = (clearedThrough: number) =>
	render(
		<AuditsView
			audits={auditdex(
				gatedex(
					ALL_SWATCHES.filter((swatch) => swatch.gate <= clearedThrough).map(
						(swatch) => swatch.id
					)
				)
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

	it("hands over no name at all for an audit past the next gate", () => {
		renderRoster(3);

		expect(
			screen.queryByText("405 Method Not Allowed")
		).not.toBeInTheDocument();
	});

	it("redacts the whole roster before a single gate has fallen", () => {
		renderRoster(-1);

		expect(screen.queryByText("402 Payment Required")).not.toBeInTheDocument();
	});

	it("states a gate's rule where the gate is one you have reached", () => {
		renderRoster(3);

		expect(screen.getByText(/Every paid action costs ×2/)).toBeInTheDocument();
	});
});
