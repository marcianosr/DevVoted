import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
	BorderCard,
	COPY,
	type BorderCardProps,
} from "~/modules/account/profile/presentation/BorderCard.ui";

const NAME = "Stack Trace";

const renderCard = (props: Partial<BorderCardProps> = {}) => {
	const onPress = vi.fn();
	const onTryOn = vi.fn();
	render(
		<BorderCard
			name={NAME}
			image="/borders/stack-trace.png"
			cost={256}
			owned={false}
			equipped={false}
			canAfford
			isMutating={false}
			tryingOn={false}
			onPress={onPress}
			onTryOn={onTryOn}
			{...props}
		/>
	);
	return { onPress, onTryOn };
};

describe("BorderCard", () => {
	it("tries the border on when the frame is pressed, without buying it", async () => {
		const { onPress, onTryOn } = renderCard();

		await userEvent.click(
			screen.getByRole("button", { name: COPY.tryOn(NAME) })
		);

		expect(onTryOn).toHaveBeenCalledOnce();
		expect(onPress).not.toHaveBeenCalled();
	});

	it("lets a border the player cannot afford still be tried on", async () => {
		const { onTryOn } = renderCard({ canAfford: false });

		await userEvent.click(
			screen.getByRole("button", { name: COPY.tryOn(NAME) })
		);

		expect(onTryOn).toHaveBeenCalledOnce();
	});

	it("marks the frame pressed while the border is being tried on", () => {
		renderCard({ tryingOn: true });

		expect(
			screen.getByRole("button", { name: COPY.tryOn(NAME) })
		).toHaveAttribute("aria-pressed", "true");
	});

	it("buys the border from its price press", async () => {
		const { onPress, onTryOn } = renderCard();

		await userEvent.click(screen.getByRole("button", { name: /Buy/ }));

		expect(onPress).toHaveBeenCalledOnce();
		expect(onTryOn).not.toHaveBeenCalled();
	});
});
