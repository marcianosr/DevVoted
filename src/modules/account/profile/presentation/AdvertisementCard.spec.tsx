import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
	AdvertisementCard,
	type AdvertisementCardProps,
	COPY,
} from "~/modules/account/profile/presentation/AdvertisementCard.ui";

const TITLE = "Looking for poll editors";
const TEXT = "Approved polls earn 16 KB archived storage!";
const CTA = { label: "Suggest a poll", href: "/polls/new" };

const renderCard = (props: Partial<AdvertisementCardProps> = {}) =>
	render(
		<AdvertisementCard
			title={TITLE}
			text={TEXT}
			icon={{ kind: "cookie" }}
			cta={CTA}
			{...props}
		/>
	);

describe("AdvertisementCard", () => {
	it("labels itself an advertisement and states its title and text", () => {
		renderCard();

		expect(
			screen.getByRole("complementary", { name: COPY.legend })
		).toBeInTheDocument();
		expect(screen.getByText(TITLE)).toBeInTheDocument();
		expect(screen.getByText(TEXT)).toBeInTheDocument();
	});

	it("links its call to action to where the offer is", () => {
		renderCard();

		expect(screen.getByRole("link", { name: CTA.label })).toHaveAttribute(
			"href",
			CTA.href
		);
	});

	it("calls onDismiss when the player closes it", async () => {
		const onDismiss = vi.fn();
		renderCard({ onDismiss });

		await userEvent.click(
			screen.getByRole("button", { name: COPY.dismiss(TITLE) })
		);

		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it("offers no close button when it cannot be dismissed", () => {
		renderCard();

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("draws the strip as one line with a link and no close button", () => {
		renderCard({ variant: "strip", onDismiss: vi.fn() });

		expect(screen.getByRole("link", { name: CTA.label })).toHaveAttribute(
			"href",
			CTA.href
		);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("shows the player's face wearing the advertised border", () => {
		const { container } = renderCard({
			icon: { kind: "face", name: "Misty", borderUrl: "/borders/rareware.svg" },
		});

		expect(
			container.querySelector('img[src="/borders/rareware.svg"]')
		).toBeInTheDocument();
	});
});
