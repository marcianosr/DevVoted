import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STORAGE_UNITS } from "~/lib/storage";
import { StorageMeter } from "./StorageMeter.ui";

describe(StorageMeter.name, () => {
	it("renders used and limit formatted as storage", () => {
		render(
			<StorageMeter used={STORAGE_UNITS.MB / 2} limit={STORAGE_UNITS.MB} />
		);
		expect(screen.getByText(/512 KB \/ 1 MB/)).toBeInTheDocument();
	});

	it("shows the earned delta when it is positive", () => {
		render(
			<StorageMeter
				used={STORAGE_UNITS.MB / 2}
				limit={STORAGE_UNITS.MB}
				delta={STORAGE_UNITS.KB * 128}
			/>
		);
		expect(screen.getByText("+128 KB")).toBeInTheDocument();
	});

	it("hides the delta when it is zero", () => {
		render(<StorageMeter used={0} limit={STORAGE_UNITS.MB} delta={0} />);
		expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
	});
});
