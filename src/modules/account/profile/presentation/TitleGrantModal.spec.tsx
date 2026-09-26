import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
	TitleGrantModal,
	type GrantedTitle,
} from "~/modules/account/profile/presentation/TitleGrantModal.ui";

const tester: GrantedTitle = {
	id: "title-legacy-tester",
	name: "Legacy Tester",
	earnedWhen: "Played before the rebuild. Cannot be earned.",
	worn: false,
};

const climber: GrantedTitle = {
	id: "title-legacy-active",
	name: "Legacy Climber",
	earnedWhen: "Still climbing when the rebuild landed. Cannot be earned.",
	worn: true,
};

const renderModal = (props: Partial<Parameters<typeof TitleGrantModal>[0]>) =>
	render(
		<TitleGrantModal
			titles={[tester]}
			onWear={vi.fn()}
			onDismiss={vi.fn()}
			{...props}
		/>
	);

describe("TitleGrantModal", () => {
	it("names every title it was handed, with the line that explains it", () => {
		renderModal({ titles: [climber, tester] });

		expect(screen.getByText("Legacy Climber")).toBeInTheDocument();
		expect(screen.getByText("Legacy Tester")).toBeInTheDocument();
		expect(
			screen.getByText("Played before the rebuild. Cannot be earned.")
		).toBeInTheDocument();
	});

	it("dates the archived run when it knows the date", () => {
		renderModal({ archivedOn: "14 Aug 2026" });

		expect(
			screen.getByText("Your run from 14 Aug 2026 has entered the archive.")
		).toBeInTheDocument();
	});

	it("says nothing about an archive when no run of theirs was cut short", () => {
		renderModal({ archivedOn: undefined });

		expect(screen.queryByText(/entered the archive/)).not.toBeInTheDocument();
	});

	it("reports which title the player chose to wear", async () => {
		const onWear = vi.fn();
		renderModal({ onWear });

		await userEvent.click(screen.getByRole("button", { name: "Wear" }));

		expect(onWear).toHaveBeenCalledWith("title-legacy-tester");
	});

	it("offers no press on a title already worn", () => {
		renderModal({ titles: [climber] });

		expect(screen.getByRole("button", { name: "Worn" })).toBeDisabled();
	});

	it("reports the dismiss so the grant can be stamped as seen", async () => {
		const onDismiss = vi.fn();
		renderModal({ onDismiss });

		await userEvent.click(screen.getByRole("button", { name: "Close" }));

		expect(onDismiss).toHaveBeenCalled();
	});

	it("refuses both presses while the choice is settling", () => {
		renderModal({ isMutating: true });

		expect(screen.getByRole("button", { name: "Wear" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
	});
});
