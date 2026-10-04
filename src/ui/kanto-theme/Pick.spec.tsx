import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Pick } from "./Pick.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const themedUtilitiesOf = (element: HTMLElement) =>
	element.className
		.split(" ")
		.map((candidate) => candidate.split(":").at(-1) ?? "")
		.filter((utility) => utility.includes("-theme"));

const renderPick = (props: Partial<Parameters<typeof Pick>[0]> = {}) =>
	render(
		<Pick label="Drop ESLint" checked={false} onToggle={() => {}} {...props} />
	);

const box = () => screen.getByRole("checkbox");

describe("Pick", () => {
	it("names what picking it does, since the square carries no text", () => {
		renderPick();

		expect(box()).toHaveAccessibleName("Drop ESLint");
	});

	it("reports its state to a reader, not only to the eye", () => {
		renderPick({ checked: true });

		expect(box()).toBeChecked();
	});

	it("hands the toggle back rather than holding state of its own", async () => {
		const onToggle = vi.fn();
		renderPick({ onToggle });

		await userEvent.click(box());

		expect(onToggle).toHaveBeenCalledOnce();
	});

	it("takes no press once the peel has no room for it", async () => {
		const onToggle = vi.fn();
		renderPick({ disabled: true, onToggle });

		await userEvent.click(box());

		expect(box()).toBeDisabled();
		expect(onToggle).not.toHaveBeenCalled();
	});

	it("fills only when picked, so an empty square reads as untouched", () => {
		const { rerender } = renderPick();
		expect(box()).not.toHaveClass("press-theme-armed");

		rerender(<Pick label="Drop ESLint" checked onToggle={() => {}} />);
		expect(box()).toHaveClass("press-theme-armed");
	});

	it.each([true, false])(
		"names only utilities app.css declares, picked %s",
		(checked) => {
			renderPick({ checked });

			const utilities = themedUtilitiesOf(box());

			expect(utilities.length).toBeGreaterThan(0);
			for (const utility of utilities) {
				expect(appCss).toContain(`@utility ${utility}`);
			}
		}
	);
});
