import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { dexControlRows, dexControlsProps } from "~/test/dexRegistry.factory";

import { DexControls } from "./DexControls.ui";

describe("DexControls", () => {
	it("heads one section with what the account has earned of the whole roster", () => {
		render(<DexControls {...dexControlsProps()} />);

		expect(screen.getByRole("heading", { name: "services" })).toBeVisible();
		expect(screen.getByText("1 of 8")).toBeVisible();
		expect(screen.getByText("registry, then run")).toBeVisible();
	});

	it("lists every service on the roster in one list, by name", () => {
		render(<DexControls {...dexControlsProps()} />);

		for (const row of dexControlRows) {
			expect(screen.getByText(row.title)).toBeVisible();
		}
	});

	it("shows an earned service's name, where it is bought and what it costs", () => {
		render(<DexControls {...dexControlsProps()} />);

		expect(screen.getByText("Rebuild the registry")).toBeVisible();
		expect(screen.getAllByText("Registry · this visit").length).toBeGreaterThan(
			0
		);
		expect(screen.getByText("from 4 KB, doubling")).toBeVisible();
	});

	it("names a locked service and states how it is earned, in place of a price", () => {
		render(<DexControls {...dexControlsProps()} />);

		expect(screen.getByText("Boot Cache")).toBeVisible();
		expect(screen.getByText("unlock · Bank 256 KB in one run")).toBeVisible();
		expect(screen.queryByText("not for sale yet")).not.toBeInTheDocument();
	});

	it("marks every locked service with a ? where its glyph would be", () => {
		render(<DexControls {...dexControlsProps()} />);

		expect(screen.getAllByText("?")).toHaveLength(
			dexControlRows.filter((row) => row.locked === true).length
		);
	});

	it("names no gate on a row, since the shop is what stages a service", () => {
		render(<DexControls {...dexControlsProps()} />);

		expect(screen.queryByText(/^gates? \d/)).not.toBeInTheDocument();
	});

	it("offers no press, because a service is bought in the run", () => {
		render(<DexControls {...dexControlsProps()} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("keeps one footer for the whole roster", () => {
		const props = dexControlsProps();
		render(<DexControls {...props} />);

		expect(screen.getByText(props.note)).toBeVisible();
	});
});
