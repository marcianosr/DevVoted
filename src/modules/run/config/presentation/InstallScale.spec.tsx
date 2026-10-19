import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InstallScale } from "./InstallScale.ui";

const valueOf = (label: string) =>
	screen.getByText(label, { selector: "dt" }).nextElementSibling;

describe("InstallScale", () => {
	it("says the build does not fit and lists the growth, the price and the bill", () => {
		render(<InstallScale from={4} to={12} perGateKb={64} price="256 KB" />);

		expect(screen.getByText("Doesn't fit.")).toBeInTheDocument();
		expect(valueOf("weight")).toHaveTextContent("4→12");
		expect(valueOf("pay now")).toHaveTextContent("−256 KB");
		expect(valueOf("upkeep")).toHaveTextContent("−64 KBevery gate");
	});

	it("marks the upkeep free when the new rung costs nothing", () => {
		render(<InstallScale from={2} to={4} perGateKb={0} price="32 KB" />);

		expect(valueOf("upkeep")).toHaveTextContent("free");
	});

	it("leads with the bill alone when the rung does not move", () => {
		render(<InstallScale from={12} to={12} perGateKb={48} price="32 KB" />);

		expect(screen.getByText("Your bill rises.")).toBeInTheDocument();
		expect(
			screen.queryByText("weight", { selector: "dt" })
		).not.toBeInTheDocument();
		expect(valueOf("upkeep")).toHaveTextContent("−48 KBevery gate");
	});

	it("leaves out what to pay now when no price is given", () => {
		render(<InstallScale from={4} to={6} perGateKb={16} />);

		expect(
			screen.queryByText("pay now", { selector: "dt" })
		).not.toBeInTheDocument();
	});
});
