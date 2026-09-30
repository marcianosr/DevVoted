import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProfileCard } from "./ProfileCard.ui";
import { ProfileScreen } from "./ProfileScreen.ui";

const TABS = [
	{ id: "polls", label: "polls" },
	{ id: "runs", label: "runs" },
] as const;

const noop = () => {};

const CARD = <ProfileCard name="marciano_schildmeijer" />;

const renderOwn = (props: Partial<Parameters<typeof ProfileScreen>[0]> = {}) =>
	render(
		<ProfileScreen
			card={CARD}
			tabs={TABS}
			activeId="polls"
			onSelect={noop}
			theme="pallet"
			archive="8.2 MB archive"
			{...props}
		>
			<p>the polls panel</p>
		</ProfileScreen>
	);

describe("ProfileScreen", () => {
	it("heads with the player's card", () => {
		renderOwn();

		expect(screen.getByText("marciano_schildmeijer")).toBeVisible();
	});

	it("titles the collection apart from the shop's registry", () => {
		renderOwn();

		expect(screen.getByRole("heading", { name: "Dex" })).toBeVisible();
	});

	it("reads out what the account is holding, with the figure in a badge", () => {
		renderOwn();

		expect(screen.getByText("8.2 MB")).toHaveClass("badge-theme");
		expect(screen.getByText("archive")).toBeVisible();
	});

	it("shows the panel it was handed", () => {
		renderOwn();

		expect(screen.getByRole("tabpanel")).toHaveTextContent("the polls panel");
	});

	it("wears the swatch it was handed", () => {
		const { container } = renderOwn({ theme: "volcano" });

		expect(container.querySelector("section")).toHaveAttribute(
			"data-gate-theme",
			"volcano"
		);
	});

	it("passes a tab press up", async () => {
		const onSelect = vi.fn();
		renderOwn({ onSelect });

		await userEvent.click(screen.getByRole("tab", { name: "runs" }));

		expect(onSelect).toHaveBeenCalledWith("runs");
	});
});

describe("ProfileScreen, seen by a visitor", () => {
	const renderVisited = () =>
		render(
			<ProfileScreen
				card={CARD}
				theme="pallet"
				sections={<p>9 of 96 polls</p>}
			/>
		);

	it("heads with the card all the same", () => {
		renderVisited();

		expect(screen.getByText("marciano_schildmeijer")).toBeVisible();
	});

	it("draws the sections it was handed under the card", () => {
		renderVisited();

		expect(screen.getByText("9 of 96 polls")).toBeVisible();
	});

	it("offers no tabs at all, because another player's collection is not shown", () => {
		renderVisited();

		expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
		expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
	});

	it("withholds the archive figure, which rides the collection heading", () => {
		renderVisited();

		expect(
			screen.queryByRole("heading", { name: "Dex" })
		).not.toBeInTheDocument();
	});
});
