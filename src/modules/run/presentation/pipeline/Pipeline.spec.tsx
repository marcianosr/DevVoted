import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { Pipeline } from "./Pipeline.ui";

describe(Pipeline, () => {
	it("renders equipped configs and empty slots up to capacity", () => {
		render(<Pipeline configs={[CONFIGS.js]} slots={3} />);
		expect(screen.getByText(".js")).toBeInTheDocument();
		expect(screen.getAllByText("empty")).toHaveLength(2);
	});

	it("removes a config when its ✕ is clicked", () => {
		const onRemove = vi.fn();
		render(<Pipeline configs={[CONFIGS.js]} slots={3} onRemove={onRemove} />);
		fireEvent.click(screen.getByRole("button"));
		expect(onRemove).toHaveBeenCalledWith("js");
	});
});
