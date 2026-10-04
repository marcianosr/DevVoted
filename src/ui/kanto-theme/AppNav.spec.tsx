import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { STORAGE_BALANCE } from "~/shared/lib/copy";
import { STORAGE_UNITS } from "~/shared/lib/storage";

import { AppNav, type AppNavProps, type NavViewer, COPY } from "./AppNav.ui";
import { COPY as TITLE_COPY } from "./WornTitles.ui";

const HOME = "/";
const SIGN_IN = "/login";
const RUN = "/run";
const COMMUNITY = "/run/community";
const SUGGEST = "/polls/new";
const PROFILE = "/profile/marciano";
const SUGGESTED = "/polls";
const SIGN_OUT = "/logout";
const BORDER = "/borders/border-ts-lavender.svg";

const NAME = "marciano_schildmeijer";

const VIEWER: NavViewer = {
	name: NAME,
	borderUrl: BORDER,
	archivedStorage: 0,
	profileHref: PROFILE,
	suggestedHref: SUGGESTED,
	signOutHref: SIGN_OUT,
};

const BAR: AppNavProps = {
	homeHref: HOME,
	signInHref: SIGN_IN,
	run: { href: RUN, pollsLeft: 5, active: false },
	community: { href: COMMUNITY, active: false },
	suggest: { href: SUGGEST, active: false },
};

const drawBar = (props: Partial<AppNavProps> = {}) =>
	render(<AppNav {...BAR} {...props} />);

const header = () => within(screen.getByRole("banner"));
const tabs = () => within(screen.getByRole("navigation", { name: COPY.tabs }));

describe("AppNav", () => {
	it("scrolls away with the page rather than pinning itself to the top", () => {
		const { container } = drawBar();

		expect(container.firstChild).not.toHaveClass("sticky");
	});

	describe("signed out", () => {
		it("offers a way in", () => {
			drawBar();

			expect(screen.getByRole("link", { name: COPY.signIn })).toHaveAttribute(
				"href",
				SIGN_IN
			);
		});

		it("offers no gated destination, because each one opens onto the login wall", () => {
			drawBar();

			expect(screen.queryByText(COPY.run)).not.toBeInTheDocument();
			expect(screen.queryByText(COPY.community)).not.toBeInTheDocument();
			expect(screen.queryByText(COPY.suggest)).not.toBeInTheDocument();
		});

		it("keeps the way home, which is open to anyone", () => {
			drawBar();

			expect(screen.getByRole("link", { name: COPY.home })).toHaveAttribute(
				"href",
				HOME
			);
		});
	});

	describe("signed in", () => {
		it("presses into the run and counts what the day has left", () => {
			drawBar({
				viewer: VIEWER,
				run: { href: RUN, pollsLeft: 3, active: false },
			});

			const press = header().getByRole("link", { name: /Daily Run/ });

			expect(press).toHaveAttribute("href", RUN);
			expect(press).toHaveTextContent("3");
		});

		it("names the balance it carries as the run's storage, not the archive", () => {
			drawBar({
				viewer: VIEWER,
				reading: { swatches: [], funds: { label: STORAGE_BALANCE, kb: 462 } },
			});

			expect(screen.getByText(COPY.runStorage)).toBeInTheDocument();
			expect(screen.getByRole("img", { name: "462 KB" })).toBeInTheDocument();
		});

		it("wears the equipped border on the player's mark, beside the bar and in the menu", () => {
			const { container } = drawBar({ viewer: VIEWER });

			expect(container.querySelectorAll(`img[src="${BORDER}"]`)).toHaveLength(
				2
			);
		});

		it("leaves the mark bare when no border is equipped", () => {
			const { container } = drawBar({
				viewer: { ...VIEWER, borderUrl: undefined },
			});

			expect(container.querySelector("img")).toBeNull();
		});

		it("offers the community and a way to suggest a poll", () => {
			drawBar({ viewer: VIEWER });

			expect(
				screen.getAllByRole("link", { name: COPY.community })[0]
			).toHaveAttribute("href", COMMUNITY);
			expect(
				screen.getAllByRole("link", { name: COPY.suggest })[0]
			).toHaveAttribute("href", SUGGEST);
		});

		it("states what an approved poll pays on every suggest link", () => {
			drawBar({
				viewer: VIEWER,
				suggest: { href: SUGGEST, active: false, reward: "+16 KB" },
			});

			const links = screen.getAllByRole("link", {
				name: COPY.suggestFor("+16 KB"),
			});
			expect(links).toHaveLength(2);
			expect(links[0]).toHaveAttribute("href", SUGGEST);
		});
	});

	describe("the count", () => {
		it("states the polls left as a bare figure", () => {
			drawBar({
				viewer: VIEWER,
				run: { href: RUN, pollsLeft: 3, active: true },
			});

			expect(header().getByText("3")).toBeInTheDocument();
		});

		it("names the count for a reader that cannot see a bare figure", () => {
			drawBar({
				viewer: VIEWER,
				run: { href: RUN, pollsLeft: 3, active: true },
			});

			expect(
				header().getByRole("link", { name: "Daily Run · 3 polls left" })
			).toBeInTheDocument();
		});

		it("says nothing at all once the day has no polls left", () => {
			drawBar({ viewer: VIEWER, run: { href: RUN, active: true } });

			expect(
				header().getByRole("link", { name: COPY.run })
			).toBeInTheDocument();
			expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
		});

		it("carries the count onto the phone's tab bar too", () => {
			drawBar({
				viewer: VIEWER,
				run: { href: RUN, pollsLeft: 3, active: true },
			});

			expect(
				tabs().getByRole("link", { name: "Daily Run · 3 polls left" })
			).toHaveTextContent("3");
		});
	});

	describe("the switcher", () => {
		it("raises only the destination you are standing on", () => {
			drawBar({
				viewer: VIEWER,
				community: { href: COMMUNITY, active: true },
			});

			expect(header().getByRole("link", { name: COPY.community })).toHaveClass(
				"bg-theme-raised"
			);
			expect(header().getByRole("link", { name: /Daily Run/ })).not.toHaveClass(
				"bg-theme-raised"
			);
		});

		it("moves the destinations to a tab bar at the bottom of a phone", () => {
			drawBar({ viewer: VIEWER });

			expect(
				header().getByRole("link", { name: COPY.community }).parentElement
			).toHaveClass("hidden", "md:flex");
			expect(screen.getByRole("navigation", { name: COPY.tabs })).toHaveClass(
				"fixed",
				"md:hidden"
			);
			expect(
				tabs()
					.getAllByRole("link")
					.map((link) => link.getAttribute("href"))
			).toEqual([RUN, COMMUNITY, PROFILE]);
		});

		it("raises the profile tab while you stand on your own page", () => {
			drawBar({ viewer: VIEWER, profileActive: true });

			expect(tabs().getByRole("link", { name: COPY.profileTab })).toHaveClass(
				"bg-theme-raised"
			);
		});

		it("draws no tab bar for a signed-out visitor", () => {
			drawBar();

			expect(
				screen.queryByRole("navigation", { name: COPY.tabs })
			).not.toBeInTheDocument();
		});
	});

	describe("the ground", () => {
		it("pins no colour, so it wears the theme of the page under it", () => {
			const { container } = drawBar({ viewer: VIEWER });

			expect(container.firstChild).not.toHaveAttribute("data-screen-theme");
			expect(container.firstChild).not.toHaveAttribute("data-gate-theme");
		});

		it("draws its chrome from that theme rather than the neutral surfaces", () => {
			const { container } = drawBar({ viewer: VIEWER });

			expect(container.querySelector("header")).toHaveClass(
				"bg-theme-faint",
				"border-theme-faint"
			);
			expect(container.firstChild).toHaveClass("bg-black");
		});

		it("raises the destination you stand on with the theme, not a zinc step", () => {
			drawBar({ viewer: VIEWER, run: { href: RUN, active: true } });

			const here = header().getByRole("link", { name: /Daily Run/ });

			expect(here).toHaveClass("bg-theme-raised", "ring-theme-soft");
			expect(here.className).not.toMatch(/bg-surface|ring-edge/);
		});

		it("leaves the player's mark its own colour inside a bar that pins none", () => {
			const { container } = drawBar({ viewer: VIEWER });

			expect(
				container.querySelectorAll('[data-screen-theme="vermillion"]')
			).toHaveLength(2);
		});
	});

	describe("the mark", () => {
		it("stands beside the bar rather than inside it", () => {
			const { container } = drawBar({ viewer: VIEWER });

			expect(container.querySelector("header details")).toBeNull();
			expect(container.querySelector("details")).not.toBeNull();
		});
	});

	describe("the account menu", () => {
		it("names the player", () => {
			drawBar({ viewer: VIEWER });

			expect(screen.getByText(NAME)).toBeInTheDocument();
		});

		it("states that no title is worn, rather than leaving the line empty", () => {
			drawBar({ viewer: VIEWER });

			expect(screen.getByText(TITLE_COPY.noTitle)).toHaveClass("border-dashed");
		});

		it("badges the worn title beside the archive once one is equipped", () => {
			drawBar({
				viewer: {
					...VIEWER,
					titles: ["Gym Leader"],
					archivedStorage: 296 * STORAGE_UNITS.KB,
				},
			});

			expect(screen.getByText("Gym Leader")).toHaveClass("badge-theme");
			expect(screen.queryByText(TITLE_COPY.noTitle)).not.toBeInTheDocument();
		});

		it("wears every equipped title, not only the first", () => {
			drawBar({
				viewer: { ...VIEWER, titles: ["Gym Leader", "Summit", "Flawless"] },
			});

			expect(screen.getByText("Gym Leader")).toBeInTheDocument();
			expect(screen.getByText("Summit")).toBeInTheDocument();
			expect(screen.getByText("Flawless")).toBeInTheDocument();
		});

		it("badges the archive figure and leaves the word beside it as prose", () => {
			drawBar({
				viewer: { ...VIEWER, archivedStorage: 296 * STORAGE_UNITS.KB },
			});

			expect(screen.getByText("296 KB")).toHaveClass("badge-theme");
			expect(screen.getByText("archived")).not.toHaveClass("badge-theme");
		});

		it("badges an empty archive too, so the line reads the same from the first run", () => {
			drawBar({ viewer: VIEWER });

			expect(screen.getByText("0 B")).toHaveClass("badge-theme");
		});

		it("links to the player's page, their suggestions and the way out", () => {
			drawBar({ viewer: VIEWER });

			expect(screen.getByRole("link", { name: COPY.profile })).toHaveAttribute(
				"href",
				PROFILE
			);
			expect(
				screen.getByRole("link", { name: COPY.suggested })
			).toHaveAttribute("href", SUGGESTED);
			expect(screen.getByRole("link", { name: COPY.signOut })).toHaveAttribute(
				"href",
				SIGN_OUT
			);
		});

		it("leaves signing out to a real page load, so nothing can prefetch it", () => {
			const onNavigate = vi.fn();
			drawBar({ viewer: VIEWER, onNavigate });

			fireEvent.click(screen.getByRole("link", { name: COPY.signOut }));

			expect(onNavigate).not.toHaveBeenCalled();
		});
	});

	describe("navigating", () => {
		it("hands a plain press to the router instead of reloading the document", () => {
			const onNavigate = vi.fn();
			drawBar({ viewer: VIEWER, onNavigate });

			fireEvent.click(header().getByRole("link", { name: /Daily Run/ }));

			expect(onNavigate).toHaveBeenCalledWith(RUN);
		});

		it("leaves a meta-press alone, so it still opens a new tab", () => {
			const onNavigate = vi.fn();
			drawBar({ viewer: VIEWER, onNavigate });

			fireEvent.click(header().getByRole("link", { name: /Daily Run/ }), {
				metaKey: true,
			});

			expect(onNavigate).not.toHaveBeenCalled();
		});

		it("leaves a middle-press alone, so it still opens a new tab", () => {
			const onNavigate = vi.fn();
			drawBar({ viewer: VIEWER, onNavigate });

			fireEvent.click(header().getByRole("link", { name: /Daily Run/ }), {
				button: 1,
			});

			expect(onNavigate).not.toHaveBeenCalled();
		});

		it("falls back to the plain link when no router is listening", () => {
			drawBar({ viewer: VIEWER });

			expect(header().getByRole("link", { name: /Daily Run/ })).toHaveAttribute(
				"href",
				RUN
			);
		});
	});
});
