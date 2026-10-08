import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { kantoHallOfFame } from "~/test/kantoCommunity.factory";

import { HallOfFame } from "./HallOfFame.ui";

describe("HallOfFame", () => {
	it("crowns the reigning champion with the moment they won", () => {
		render(<HallOfFame {...kantoHallOfFame()} />);

		expect(
			screen.getByText("Champion since 13 May 2026, 14:05")
		).toBeInTheDocument();
	});

	it("lists every win, a repeat champion once per summit", () => {
		render(<HallOfFame {...kantoHallOfFame()} />);

		expect(screen.getByText("25 Dec 2025, 09:30")).toBeInTheDocument();
		expect(screen.getByText("24 Dec 2025, 21:00")).toBeInTheDocument();
		expect(screen.getAllByText("13 May 2026, 14:05")).toHaveLength(1);
	});

	it("holds the seat open with a title over its caption before anyone summits", () => {
		const hall = kantoHallOfFame({ champion: undefined, history: [] });
		render(<HallOfFame {...hall} />);

		expect(screen.getByText(hall.empty.title)).toBeInTheDocument();
		expect(screen.getByText(hall.empty.caption)).toBeInTheDocument();
		expect(screen.queryByText(hall.historyLabel)).not.toBeInTheDocument();
	});
});
