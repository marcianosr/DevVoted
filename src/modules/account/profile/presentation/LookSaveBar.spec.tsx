import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	COPY,
	LookSaveBar,
	type LookSaveBarProps,
} from "~/modules/account/profile/presentation/LookSaveBar.ui";

const handlers = { onSave: vi.fn(), onDiscard: vi.fn() };

const renderBar = (props: Partial<LookSaveBarProps> = {}) =>
	render(<LookSaveBar canSave {...handlers} {...props} />);

describe("LookSaveBar", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("says the look is unsaved and that the card above is only a preview", () => {
		renderBar();

		expect(screen.getByRole("region", { name: COPY.label })).toBeVisible();
		expect(screen.getByText(COPY.hint)).toBeVisible();
	});

	it("saves the look on its press", async () => {
		renderBar();

		await userEvent.click(screen.getByRole("button", { name: COPY.save }));

		expect(handlers.onSave).toHaveBeenCalledOnce();
	});

	it("throws the draft away on discard", async () => {
		renderBar();

		await userEvent.click(screen.getByRole("button", { name: COPY.discard }));

		expect(handlers.onDiscard).toHaveBeenCalledOnce();
	});

	it("holds the save press back while a save is in flight", () => {
		renderBar({ canSave: false });

		expect(screen.getByRole("button", { name: COPY.save })).toBeDisabled();
	});

	it("states why a save was refused", () => {
		renderBar({ error: "Cannot wear a border you don't own" });

		expect(
			screen.getByText("Cannot wear a border you don't own")
		).toBeVisible();
	});
});
