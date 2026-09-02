import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { createMockRunView } from "~/test/runView.factory";

import { RemovalView } from "./RemovalView.component";

const view = createMockRunView({
	gatesCleared: 4,
	peelSlotsRemaining: 2,
	configs: [CONFIGS.js, CONFIGS.ts, CONFIGS.eslint],
});

const noop = () => {};

const removeButton = () => screen.getByRole("button", { name: /^Remove/ });

describe("RemovalView", () => {
	it("names the gate that is holding", () => {
		render(<RemovalView view={view} onReviewAnswers={noop} onRemove={noop} />);

		expect(screen.getByText("Lavender holds")).toBeInTheDocument();
	});

	it("offers the whole build, since any of it can be peeled", () => {
		render(<RemovalView view={view} onReviewAnswers={noop} onRemove={noop} />);

		expect(screen.getAllByRole("checkbox")).toHaveLength(3);
	});

	// The peel is counted in SLOTS, not configs, so a 4-slot config settles a
	// 2-slot debt on its own.
	it("holds the commit shut until the picked configs cover the slot debt", async () => {
		render(<RemovalView view={view} onReviewAnswers={noop} onRemove={noop} />);

		expect(removeButton()).toBeDisabled();

		await userEvent.click(screen.getByRole("checkbox", { name: /\.js/ }));
		expect(removeButton()).toBeDisabled();

		await userEvent.click(screen.getByRole("checkbox", { name: /\.ts/ }));
		expect(removeButton()).toBeEnabled();
	});

	it("counts down the slots still owed", async () => {
		render(<RemovalView view={view} onReviewAnswers={noop} onRemove={noop} />);

		expect(screen.getByText("Remove 2 more slots")).toBeInTheDocument();

		await userEvent.click(screen.getByRole("checkbox", { name: /\.js/ }));

		expect(screen.getByText("Remove 1 more slot")).toBeInTheDocument();
	});

	// The reducer strips one config at a time; the screen commits to a set. The
	// order is the pick order, so a peel that empties the build does so
	// predictably.
	it("hands back every picked config at once, in pick order", async () => {
		const onRemove = vi.fn();
		render(
			<RemovalView view={view} onReviewAnswers={noop} onRemove={onRemove} />
		);

		await userEvent.click(screen.getByRole("checkbox", { name: /ESLint/ }));
		await userEvent.click(screen.getByRole("checkbox", { name: /\.js/ }));
		await userEvent.click(removeButton());

		expect(onRemove).toHaveBeenCalledWith([CONFIGS.eslint.id, CONFIGS.js.id]);
	});

	it("lets a config be unpicked, so a misclick is not a peel", async () => {
		render(<RemovalView view={view} onReviewAnswers={noop} onRemove={noop} />);

		const js = screen.getByRole("checkbox", { name: /\.js/ });
		await userEvent.click(js);
		await userEvent.click(js);

		expect(js).not.toBeChecked();
	});

	// The hold summary and the peel picker are one screen now, so review has to
	// be reachable from it rather than from a step before it.
	it("reaches the answer review from the hold screen", async () => {
		const onReviewAnswers = vi.fn();
		render(
			<RemovalView
				view={view}
				onReviewAnswers={onReviewAnswers}
				onRemove={noop}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Review answers" })
		);

		expect(onReviewAnswers).toHaveBeenCalledOnce();
	});

	it("states how short of the gate the run fell", () => {
		render(<RemovalView view={view} onReviewAnswers={noop} onRemove={noop} />);

		expect(screen.getByText(/^short by /)).toBeInTheDocument();
	});
});
