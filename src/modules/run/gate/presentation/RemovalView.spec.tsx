import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { createMockRunView } from "~/test/runView.factory";

import { RemovalView } from "./RemovalView.component";

const view = createMockRunView({
	gatesCleared: 4,
	stripsRemaining: 2,
	configs: [CONFIGS.js, CONFIGS.ts, CONFIGS.eslint],
});

describe("RemovalView", () => {
	it("names the gate that is being retried and what it takes", () => {
		render(<RemovalView view={view} onRemove={() => {}} />);

		expect(
			screen.getByRole("heading", { name: "Lavender gate · remove 2 configs" })
		).toBeInTheDocument();
	});

	it("offers the whole pipeline, since any of it can be peeled", () => {
		render(<RemovalView view={view} onRemove={() => {}} />);

		expect(screen.getAllByRole("checkbox")).toHaveLength(3);
	});

	it("holds the commit shut until the quota is met exactly", async () => {
		render(<RemovalView view={view} onRemove={() => {}} />);

		const remove = screen.getByRole("button", {
			name: /Remove and go to shop/,
		});
		expect(remove).toBeDisabled();

		await userEvent.click(screen.getByRole("checkbox", { name: /\.js/ }));
		expect(remove).toBeDisabled();

		await userEvent.click(screen.getByRole("checkbox", { name: /\.ts/ }));
		expect(remove).toBeEnabled();
	});

	// The reducer strips one config at a time; the screen commits to a set. The
	// order is the pick order, so a peel that empties the build does so
	// predictably.
	it("hands back every picked config at once, in pick order", async () => {
		const onRemove = vi.fn();
		render(<RemovalView view={view} onRemove={onRemove} />);

		await userEvent.click(screen.getByRole("checkbox", { name: /ESLint/ }));
		await userEvent.click(screen.getByRole("checkbox", { name: /\.js/ }));
		await userEvent.click(
			screen.getByRole("button", { name: /Remove and go to shop/ })
		);

		expect(onRemove).toHaveBeenCalledWith([CONFIGS.eslint.id, CONFIGS.js.id]);
	});

	it("lets a config be unpicked, so a misclick is not a peel", async () => {
		render(<RemovalView view={view} onRemove={() => {}} />);

		const js = screen.getByRole("checkbox", { name: /\.js/ });
		await userEvent.click(js);
		await userEvent.click(js);

		expect(js).not.toBeChecked();
	});
});
