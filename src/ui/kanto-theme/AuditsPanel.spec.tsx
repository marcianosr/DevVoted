import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	kantoAudits,
	kantoAuditsLocked,
	kantoAuditsNoSender,
	kantoAuditsQuiet,
} from "~/test/kantoIncidents.factory";

import { AuditsPanel } from "./AuditsPanel.ui";

describe("AuditsPanel", () => {
	it("names the audit and who fired it", () => {
		render(<AuditsPanel {...kantoAudits()} />);

		expect(screen.getByText("507")).toBeInTheDocument();
		expect(screen.getByText("Insufficient Storage")).toBeInTheDocument();
		expect(screen.getByText("Koga")).toBeInTheDocument();
		expect(screen.getByText("Erika")).toBeInTheDocument();
	});

	it("counts what is firing rather than leaving the header bare", () => {
		render(<AuditsPanel {...kantoAudits()} />);

		expect(screen.getByText("2 firing this gate")).toBeInTheDocument();
	});

	it("bills the clear beside what the gate throws at you", () => {
		render(<AuditsPanel {...kantoAudits()} />);

		expect(screen.getByText("−32 KB")).toBeInTheDocument();
	});

	it("says so rather than inventing a sender it does not have", () => {
		render(<AuditsPanel {...kantoAuditsNoSender()} />);

		expect(screen.getByText("no sender")).toBeInTheDocument();
		expect(screen.queryByText("from")).not.toBeInTheDocument();
	});

	it("calls a quiet gate quiet", () => {
		render(<AuditsPanel {...kantoAuditsQuiet()} />);

		expect(screen.getByText("none this gate")).toBeInTheDocument();
	});

	it("draws itself shut below the gate a rival could reach", () => {
		render(<AuditsPanel {...kantoAuditsLocked()} />);

		expect(
			screen.getByText("Audits are unlocked at gate 3 · Thunder")
		).toBeInTheDocument();
		expect(screen.getByText("gate 3 · Thunder")).toBeInTheDocument();
	});

	describe("answering the sender", () => {
		it("presses through to whoever fired it", async () => {
			const onPress = vi.fn();
			const panel = kantoAudits();
			render(
				<AuditsPanel
					{...panel}
					rows={panel.rows.map((row) => ({ ...row, respond: { onPress } }))}
				/>
			);

			await userEvent.click(
				screen.getAllByRole("button", { name: "respond" })[0]
			);

			expect(onPress).toHaveBeenCalled();
		});

		it("states why a sender cannot be answered instead of hiding the press", () => {
			const panel = kantoAudits();
			render(
				<AuditsPanel
					{...panel}
					rows={panel.rows.map((row) => ({
						...row,
						respond: { disabled: true, hint: "Koga is out of range" },
					}))}
				/>
			);

			expect(
				screen.getAllByRole("button", { name: "Koga is out of range" })[0]
			).toBeDisabled();
		});
	});
});
