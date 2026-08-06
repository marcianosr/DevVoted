import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STORAGE_CAP_KB } from "~/modules/run/rules.model";
import { StorageGauge } from "./StorageGauge.ui";

describe(StorageGauge, () => {
	it("leads with the headroom left, not the amount held", () => {
		render(<StorageGauge usedKb={184} capKb={512} />);
		expect(screen.getByText("328")).toBeInTheDocument();
		expect(screen.getByText("free")).toBeInTheDocument();
		expect(screen.getByText("184 of 512 used")).toBeInTheDocument();
	});

	it("fills the bar by what is committed, against the cap", () => {
		render(<StorageGauge usedKb={128} capKb={512} />);
		const bar = screen.getByRole("progressbar", { name: "storage used" });
		expect(bar).toHaveAttribute("aria-valuenow", "128");
		expect(bar).toHaveAttribute("aria-valuemax", "512");
		expect(bar.firstElementChild).toHaveStyle({ width: "25%" });
	});

	it("reads all free on an empty run", () => {
		render(<StorageGauge usedKb={0} capKb={STORAGE_CAP_KB} />);
		expect(screen.getByText(String(STORAGE_CAP_KB))).toBeInTheDocument();
		expect(screen.getByText(`0 of ${STORAGE_CAP_KB} used`)).toBeInTheDocument();
	});

	it("reads nothing free at the cap", () => {
		render(<StorageGauge usedKb={512} capKb={512} />);
		expect(screen.getByText("0")).toBeInTheDocument();
		expect(screen.getByText("512 of 512 used")).toBeInTheDocument();
	});

	it("clamps a run that somehow overshot the cap", () => {
		render(<StorageGauge usedKb={600} capKb={512} />);
		expect(screen.getByText("0")).toBeInTheDocument();
		expect(screen.getByRole("progressbar").firstElementChild).toHaveStyle({
			width: "100%",
		});
	});
});
