import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { kantoBootedPanel, kantoWarmBootPanel } from "~/test/kantoPoll.factory";

import { WarmBoot } from "./WarmBoot.ui";

describe("WarmBoot", () => {
	it("heads the panel with the archive it draws from", () => {
		render(<WarmBoot {...kantoWarmBootPanel()} />);

		expect(screen.getByText("Warm boot")).toBeInTheDocument();
		expect(screen.getByText("512 KB archived")).toBeInTheDocument();
	});

	it("offers a checkbox per rung and per carried service, named by what it carries", () => {
		render(<WarmBoot {...kantoWarmBootPanel()} />);

		expect(screen.getAllByRole("checkbox")).toHaveLength(5);
		expect(
			screen.getByRole("checkbox", { name: "carry Boot Cache · 64 KB" })
		).not.toBeChecked();
		expect(
			screen.getByRole("checkbox", { name: "carry Extend the registry" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("checkbox", { name: "carry git tag" })
		).toBeEnabled();
	});

	it("states both figures on a rung: the archive it costs and the storage it banks", () => {
		render(<WarmBoot {...kantoWarmBootPanel()} />);

		expect(screen.getByText("Boot Cache · 64 KB")).toBeInTheDocument();
		expect(screen.getAllByText("128 KB").length).toBeGreaterThan(0);
		expect(screen.getByText("Boot Cache · 256 KB")).toBeInTheDocument();
		expect(screen.getByText("512 KB")).toBeInTheDocument();
	});

	it("ticks what the draft holds and states the balance after it", () => {
		render(
			<WarmBoot
				{...kantoWarmBootPanel(512, { rung: 1, serviceIds: ["pin"] })}
			/>
		);

		expect(
			screen.getByRole("checkbox", { name: "carry Boot Cache · 128 KB" })
		).toBeChecked();
		expect(
			screen.getByRole("checkbox", { name: "carry git tag" })
		).toBeChecked();
		expect(
			screen.getByRole("checkbox", { name: "carry Boot Cache · 64 KB" })
		).not.toBeChecked();
		expect(
			screen.getByText("512 KB archived · 128 KB after")
		).toBeInTheDocument();
	});

	it("disables the checkbox of a row the archive cannot cover and says how short it is", () => {
		render(<WarmBoot {...kantoWarmBootPanel(100)} />);

		expect(
			screen.getByRole("checkbox", { name: "carry Boot Cache · 64 KB" })
		).toBeDisabled();
		expect(screen.getAllByText("28 KB short")).toHaveLength(2);
		expect(
			screen.getByRole("checkbox", { name: "carry Extend the registry" })
		).toBeEnabled();
	});

	it("reads back a booted run with no checkboxes, stating what was spent", () => {
		render(<WarmBoot {...kantoBootedPanel()} />);

		expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
		expect(screen.getByText("Boot Cache · 128 KB banked")).toBeInTheDocument();
		expect(screen.getByText("git tag")).toBeInTheDocument();
		expect(
			screen.getByText("spent 384 KB · 128 KB archived")
		).toBeInTheDocument();
	});

	it("keeps the footnote saying nothing is paid until the start", () => {
		const props = kantoWarmBootPanel();
		render(<WarmBoot {...props} />);

		expect(props.note).toBeDefined();
		expect(screen.getByText(props.note ?? "")).toBeInTheDocument();
	});
});
