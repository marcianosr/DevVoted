import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
	BorderCard,
	COPY,
	type BorderCardProps,
} from "~/modules/account/profile/presentation/BorderCard.ui";

const NAME = "Stack Trace";
const COST = 256 * 1024;

const renderCard = (props: Partial<BorderCardProps> = {}) => {
	const onPress = vi.fn();
	const onBuy = vi.fn();
	render(
		<BorderCard
			name={NAME}
			image="/borders/stack-trace.png"
			cost={COST}
			owned={false}
			picked={false}
			canAfford
			isMutating={false}
			tryingOn={false}
			onPress={onPress}
			onBuy={onBuy}
			{...props}
		/>
	);
	return { onPress, onBuy };
};

describe("BorderCard", () => {
	it("tries a locked border on from its frame, without buying it", async () => {
		const { onPress, onBuy } = renderCard();

		await userEvent.click(
			screen.getByRole("button", { name: COPY.tryOn(NAME) })
		);

		expect(onPress).toHaveBeenCalledOnce();
		expect(onBuy).not.toHaveBeenCalled();
	});

	it("states a locked border's price and offers no buy press until it is tried on", () => {
		renderCard();

		expect(screen.getByText("256 KB")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: COPY.buy(COST) })
		).not.toBeInTheDocument();
	});

	it("buys a border while it is being tried on", async () => {
		const { onBuy } = renderCard({ tryingOn: true });

		await userEvent.click(screen.getByRole("button", { name: COPY.buy(COST) }));

		expect(onBuy).toHaveBeenCalledOnce();
	});

	it("refuses the buy press when the archive cannot pay for it", () => {
		renderCard({ tryingOn: true, canAfford: false });

		expect(screen.getByRole("button", { name: COPY.buy(COST) })).toBeDisabled();
	});

	it("marks an owned border owned and wears it from its frame", async () => {
		const { onPress } = renderCard({ owned: true, picked: true });

		const frame = screen.getByRole("button", { name: COPY.pick(NAME) });
		await userEvent.click(frame);

		expect(screen.getByText(COPY.owned)).toBeInTheDocument();
		expect(frame).toHaveAttribute("aria-pressed", "true");
		expect(onPress).toHaveBeenCalledOnce();
	});
});
