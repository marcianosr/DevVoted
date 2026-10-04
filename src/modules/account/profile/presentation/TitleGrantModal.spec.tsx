import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
	TitleGrantModal,
	type GrantedTitle,
	type TitleGrantModalProps,
} from "~/modules/account/profile/presentation/TitleGrantModal.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";

const tester: GrantedTitle = {
	id: "title-legacy-tester",
	name: "Legacy Tester",
	worn: false,
};

const climber: GrantedTitle = {
	id: "title-legacy-active",
	name: "Legacy Climber",
	worn: true,
};

const GAIN_THEME = "viridian";
const AT_CAP = "You already wear 3 titles.";

const renderModal = (props: Partial<TitleGrantModalProps>) =>
	render(
		<TitleGrantModal
			titles={[tester]}
			wears={1}
			onWear={vi.fn()}
			onDismiss={vi.fn()}
			{...props}
		/>
	);

const press = (name: string | RegExp) => screen.getByRole("button", { name });

describe("TitleGrantModal", () => {
	it("names every title under the thanks heading", () => {
		renderModal({ titles: [climber, tester] });

		expect(
			screen.getByRole("heading", { name: "Thank you for playing" })
		).toBeInTheDocument();
		expect(screen.getByText("Legacy Climber")).toBeInTheDocument();
		expect(screen.getByText("Legacy Tester")).toBeInTheDocument();
	});

	it("badges each title as a gain, and the storage credit beside them", () => {
		renderModal({ titles: [climber, tester], archiveBonus: "1 MB" });

		const titleGains = screen.getAllByText("+ title");
		expect(titleGains).toHaveLength(2);
		for (const gain of titleGains) {
			expect(gain).toHaveAttribute("data-screen-theme", GAIN_THEME);
		}
		expect(screen.getByText("Archived storage")).toBeInTheDocument();
		expect(screen.getByText("+ 1 MB")).toHaveAttribute(
			"data-screen-theme",
			GAIN_THEME
		);
	});

	it("says nothing about storage when the account was never paid", () => {
		renderModal({ archiveBonus: undefined });

		expect(screen.queryByText("Archived storage")).not.toBeInTheDocument();
	});

	it("keeps the archived run's date in the footer line when it knows it", () => {
		renderModal({ archivedOn: "14 Aug 2026" });

		expect(
			screen.getByText(
				"history kept · run from 14 Aug 2026 archived · new runs use the current rules"
			)
		).toBeInTheDocument();
	});

	it("keeps the footer to history and rules when no run was cut short", () => {
		renderModal({ archivedOn: undefined });

		expect(
			screen.getByText("history kept · new runs use the current rules")
		).toBeInTheDocument();
	});

	it("wears the title with one press, and reports it", async () => {
		const onWear = vi.fn();
		renderModal({ onWear });

		await userEvent.click(press("Wear the title"));

		expect(onWear).toHaveBeenCalledOnce();
	});

	it("pluralises the press when more than one title is unworn", () => {
		renderModal({ titles: [tester, { ...climber, worn: false }], wears: 2 });

		expect(press("Wear the titles")).toBeEnabled();
	});

	it("shuts the press and says why when the account is at the cap", async () => {
		const onWear = vi.fn();
		renderModal({ wears: 0, note: AT_CAP, onWear });

		const shut = press(`Wear the title · ${AT_CAP}`);
		expect(shut).toBeDisabled();

		await userEvent.click(shut);

		expect(onWear).not.toHaveBeenCalled();
	});

	it("closes instead of wearing when every title is already on", async () => {
		const onWear = vi.fn();
		const onDismiss = vi.fn();
		renderModal({ titles: [climber], wears: 0, onWear, onDismiss });

		await userEvent.click(press("Close"));

		expect(onDismiss).toHaveBeenCalledOnce();
		expect(onWear).not.toHaveBeenCalled();
	});

	it("reports the dismiss so the grant can be stamped as seen", async () => {
		const onDismiss = vi.fn();
		renderModal({ onDismiss });

		await userEvent.click(press("Later"));

		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it("refuses both presses while the choice is settling", () => {
		renderModal({ isMutating: true });

		expect(press("Wear the title")).toBeDisabled();
		expect(press("Later")).toBeDisabled();
	});

	it("seats Later in the kit's own row beside the press", () => {
		renderModal({});

		expect(press("Later").closest("footer")).toContainElement(
			press("Wear the title")
		);
	});

	it("wears cerulean whatever screen it opens over", () => {
		render(
			<Screen theme="viridian">
				<TitleGrantModal
					titles={[tester]}
					wears={1}
					onWear={vi.fn()}
					onDismiss={vi.fn()}
				/>
			</Screen>
		);

		expect(screen.getByRole("dialog")).toHaveAttribute(
			"data-screen-theme",
			"cerulean"
		);
	});
});
