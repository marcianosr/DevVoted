import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import { useScrollToTop } from "~/modules/run/run/application/useScrollToTop.hook";

const PATHNAME = { value: "/run/poll" };
const RUN: {
	view: { poll: { id: string } | null; allAnswered: unknown[] } | null;
} = { view: { poll: { id: "poll-1" }, allAnswered: [] } };

vi.mock("@tanstack/react-router", () => ({
	useRouterState: ({
		select,
	}: {
		select: (state: { location: { pathname: string } }) => string;
	}) => select({ location: { pathname: PATHNAME.value } }),
}));

vi.mock("~/modules/run/run/application/useTodaysRun.hook", () => ({
	useTodaysRun: () => RUN,
}));

const Screen = () => {
	useScrollToTop();
	return null;
};

describe("useScrollToTop", () => {
	beforeEach(() => {
		window.scrollTo = vi.fn();
		PATHNAME.value = "/run/poll";
		RUN.view = { poll: { id: "poll-1" }, allAnswered: [] };
	});

	it("puts the screen the player lands on at its top", () => {
		render(<Screen />);

		expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
	});

	it("scrolls again on the next poll, which never changes the URL", () => {
		const { rerender } = render(<Screen />);
		vi.mocked(window.scrollTo).mockClear();

		RUN.view = { poll: { id: "poll-2" }, allAnswered: [{}] };
		rerender(<Screen />);

		expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
	});

	it("scrolls on a route hop the router replaces rather than pushes", () => {
		const { rerender } = render(<Screen />);
		vi.mocked(window.scrollTo).mockClear();

		PATHNAME.value = "/run/gate";
		rerender(<Screen />);

		expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
	});

	it("holds its place while the same screen re-renders", () => {
		const { rerender } = render(<Screen />);
		vi.mocked(window.scrollTo).mockClear();

		rerender(<Screen />);

		expect(window.scrollTo).not.toHaveBeenCalled();
	});
});
