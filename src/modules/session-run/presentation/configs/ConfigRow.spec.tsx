import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster";
import { ConfigRow } from "./ConfigRow.ui";

describe("ConfigRow", () => {
	it("renders the config chip and its description", () => {
		render(<ConfigRow config={CONFIGS.js} />);
		expect(screen.getByText(".js")).toBeInTheDocument();
		expect(screen.getByText(CONFIGS.js.description)).toBeInTheDocument();
	});

	it("calls onClick from its chip action", () => {
		const onClick = vi.fn();
		render(
			<ConfigRow config={CONFIGS.copilot} action="draft ＋" onClick={onClick} />
		);
		fireEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
