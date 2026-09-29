import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPlayerCard } from "~/modules/run/community/application/playerCard.serverfn";
import { PlayerHover } from "~/modules/run/community/presentation/PlayerHover.component";
import { Climber } from "~/ui/kanto-theme/Climber.ui";

vi.mock("~/modules/run/community/application/playerCard.serverfn", () => ({
	getPlayerCard: vi.fn(),
}));

const MISTY_CARD = {
	success: true,
	data: {
		userId: "misty-id",
		displayName: "misty",
		title: "Ship It",
		run: {
			gate: 2,
			coveragePercent: 40,
			streak: 3,
			storageKb: 512,
			bestCategory: "css",
			build: { configs: [{ id: "eslint", label: "ESLint", slots: 1 }] },
		},
	},
} as const;

const renderFace = () =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<PlayerHover>
				<Climber userId="misty-id" name="misty" />
			</PlayerHover>
		</QueryClientProvider>
	);

const face = () => screen.getByRole("link", { name: "misty's profile" });

describe("PlayerHover", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getPlayerCard).mockResolvedValue(MISTY_CARD);
	});

	it("waits for the pointer to settle before it shows or asks for anything", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.hover(face());

		expect(screen.queryByRole("tooltip")).toBeNull();
		expect(getPlayerCard).not.toHaveBeenCalled();
	});

	it("shows the player's card once the pointer rests on their face", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.hover(face());

		const card = await screen.findByRole("tooltip");
		expect(card).toHaveTextContent("Ship It");
		expect(card).toHaveTextContent("ESLint");
	});

	it("shows the card read-only, with no press or link in it", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.hover(face());

		const card = await screen.findByRole("tooltip");
		expect(card.querySelector("button, a")).toBeNull();
		expect(card).toHaveClass("pointer-events-none");
	});

	it("shows the card when the face takes keyboard focus", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.tab();

		expect(await screen.findByRole("tooltip")).toBeInTheDocument();
	});

	it("puts the card away when the pointer leaves", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.hover(face());
		await screen.findByRole("tooltip");
		await user.unhover(face());

		expect(screen.queryByRole("tooltip")).toBeNull();
	});

	it("never shows a card the pointer left before it settled", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.hover(face());
		await user.unhover(face());

		await new Promise((resolve) => setTimeout(resolve, 400));
		expect(screen.queryByRole("tooltip")).toBeNull();
		expect(getPlayerCard).not.toHaveBeenCalled();
	});

	it("asks for a player's card once, however often their face is hovered", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.hover(face());
		await screen.findByRole("tooltip");
		await user.unhover(face());
		await user.hover(face());
		await screen.findByRole("tooltip");

		expect(getPlayerCard).toHaveBeenCalledOnce();
		expect(getPlayerCard).toHaveBeenCalledWith({
			data: { userId: "misty-id" },
		});
	});

	it("still sends a click on the face to the player's in-game page", () => {
		renderFace();

		expect(face()).toHaveAttribute("href", "/profile/misty-id");
	});

	it("describes the face by the card it shows", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.hover(face());
		const card = await screen.findByRole("tooltip");

		await waitFor(() =>
			expect(face()).toHaveAttribute("aria-describedby", card.id)
		);
	});
});
