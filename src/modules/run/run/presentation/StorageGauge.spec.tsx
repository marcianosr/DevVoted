import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STORAGE_CAP_KB } from "~/modules/run/run/domain/rules.model";
import { StorageGauge } from "~/modules/run/run/presentation/StorageGauge.ui";

describe(StorageGauge, () => {
	it("reads the used amount against the cap", () => {
		render(<StorageGauge usedKb={64} capKb={512} />);
		expect(screen.getByText("64 / 512 KB stored")).toBeInTheDocument();
	});

	it("fills the bar in proportion to what is committed", () => {
		render(<StorageGauge usedKb={128} capKb={512} />);
		const bar = screen.getByRole("progressbar", { name: "storage used" });
		expect(bar).toHaveAttribute("aria-valuenow", "128");
		expect(bar).toHaveAttribute("aria-valuemax", "512");
		expect(bar.firstElementChild).toHaveStyle({ width: "25%" });
	});

	it("reads all free on an empty run", () => {
		render(<StorageGauge usedKb={0} capKb={STORAGE_CAP_KB} />);
		expect(
			screen.getByText(`0 / ${STORAGE_CAP_KB} KB stored`)
		).toBeInTheDocument();
		expect(screen.getByRole("progressbar").firstElementChild).toHaveStyle({
			width: "0%",
		});
	});

	it("reads full at the cap", () => {
		render(<StorageGauge usedKb={512} capKb={512} />);
		expect(screen.getByText("512 / 512 KB stored")).toBeInTheDocument();
		expect(screen.getByRole("progressbar").firstElementChild).toHaveStyle({
			width: "100%",
		});
	});

	it("clamps a run that somehow overshot the cap", () => {
		render(<StorageGauge usedKb={600} capKb={512} />);
		expect(screen.getByText("512 / 512 KB stored")).toBeInTheDocument();
		expect(screen.getByRole("progressbar")).toHaveAttribute(
			"aria-valuenow",
			"512"
		);
		expect(screen.getByRole("progressbar").firstElementChild).toHaveStyle({
			width: "100%",
		});
	});
});
