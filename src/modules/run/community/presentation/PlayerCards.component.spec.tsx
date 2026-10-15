import { QueryClientProvider } from "@tanstack/react-query";

import { createTestQueryClient } from "~/test/queryClient.harness";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getPlayerCard } from "~/modules/run/community/application/playerCard.serverfn";
import { PlayerCards } from "~/modules/run/community/presentation/PlayerCards.component";
import { Climber } from "~/ui/kanto-theme/Climber.ui";

vi.mock("~/modules/run/community/application/playerCard.serverfn", () => ({
	getPlayerCard: vi.fn(),
}));

const MISTY_CARD = {
	success: true,
	data: {
		userId: "misty-id",
		displayName: "misty",
		titles: ["Ship It"],
		theme: "gate-pallet",
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
		<QueryClientProvider client={createTestQueryClient()}>
			<PlayerCards>
				<Climber userId="misty-id" name="misty" />
			</PlayerCards>
		</QueryClientProvider>
	);

const face = () => screen.getByRole("button", { name: "misty's card" });

const fullCard = (): HTMLElement => {
	const card = document.getElementById(
		face().getAttribute("popovertarget") ?? ""
	);
	if (card === null) throw new Error("the face targets no popover");
	return card;
};

describe("PlayerCards", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getPlayerCard).mockResolvedValue(MISTY_CARD);
	});

	afterEach(() => {
		Reflect.deleteProperty(HTMLElement.prototype, "hidePopover");
	});

	it("asks for nothing until someone reaches for the face", () => {
		renderFace();

		expect(getPlayerCard).not.toHaveBeenCalled();
	});

	it("fills the hover card once the pointer reaches the face", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.hover(face());

		const card = screen.getByRole("tooltip");
		expect(await within(card).findByText("Ship It")).toBeInTheDocument();
		expect(card).toHaveTextContent("ESLint");
	});

	it("keeps the hover card read-only, with no press or link in it", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.hover(face());

		const card = screen.getByRole("tooltip");
		await within(card).findByText("Ship It");
		expect(card.querySelector("button, a")).toBeNull();
	});

	it("fills the hover card when the face takes keyboard focus", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.tab();

		expect(
			await within(screen.getByRole("tooltip")).findByText("Ship It")
		).toBeInTheDocument();
	});

	it("opens the full card as a popover from the face", () => {
		renderFace();

		expect(fullCard()).toHaveAttribute("popover", "auto");
	});

	it("links the name on the full card to the player's in-game page", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.click(face());

		expect(
			await within(fullCard()).findByRole("link", {
				name: "misty",
				hidden: true,
			})
		).toHaveAttribute("href", "/profile/misty-id");
	});

	it("closes the full card from its close button", async () => {
		const hidePopover = vi.fn();
		Object.defineProperty(HTMLElement.prototype, "hidePopover", {
			value: hidePopover,
			configurable: true,
		});
		const user = userEvent.setup();
		renderFace();

		await user.click(face());
		await user.click(
			await within(fullCard()).findByRole("button", {
				name: "Close misty",
				hidden: true,
			})
		);

		expect(hidePopover).toHaveBeenCalledOnce();
	});

	it("asks for a player's card once, however often their face is reached for", async () => {
		const user = userEvent.setup();
		renderFace();

		await user.hover(face());
		await within(screen.getByRole("tooltip")).findByText("Ship It");
		await user.unhover(face());
		await user.click(face());

		expect(getPlayerCard).toHaveBeenCalledOnce();
		expect(getPlayerCard).toHaveBeenCalledWith({
			data: { userId: "misty-id" },
		});
	});
});
