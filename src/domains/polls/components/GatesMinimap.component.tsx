import { clsx } from "clsx";

import type { ActiveRunPlayer } from "~/domains/polls/api/communityStats.queries";
import UserAvatar from "~/domains/users/components/UserAvatar.component";

type GatesMinimapProps = {
	players: ActiveRunPlayer[];
};

const MAX_VISIBLE_AVATARS = 4;
const TRACK_LEFT_MARGIN = 5;
const TRACK_RIGHT_MARGIN = 5;

const groupPlayersByGate = (
	players: ActiveRunPlayer[]
): Map<number, ActiveRunPlayer[]> =>
	players.reduce<Map<number, ActiveRunPlayer[]>>((acc, player) => {
		const existing = acc.get(player.currentGate) ?? [];
		acc.set(player.currentGate, [...existing, player]);
		return acc;
	}, new Map());

const computeTrackPosition = (gate: number, leaderGate: number): number => {
	const usableRange = 100 - TRACK_LEFT_MARGIN - TRACK_RIGHT_MARGIN;
	const denom = Math.max(leaderGate - 1, 1);
	const fraction = (gate - 1) / denom;
	return TRACK_LEFT_MARGIN + fraction * usableRange;
};

const GatesMinimap = ({ players }: GatesMinimapProps) => {
	if (players.length === 0) return null;

	const leaderGate = Math.max(...players.map((p) => p.currentGate));
	const gateGroups = groupPlayersByGate(players);
	const sortedGates = [...gateGroups.keys()].sort((a, b) => a - b);

	return (
		<div className="mt-4">
			<p className="text-xl">{players.length} player(s) currently in a run</p>
			<div className="relative mt-4 h-36">
				<div
					className={clsx(
						"absolute left-0 right-0 bottom-8 h-1",
						"rounded-full bg-gradient-to-r",
						"from-zinc-700 via-zinc-500 to-zinc-700"
					)}
				/>

				{sortedGates.map((gate) => {
					const groupPlayers = gateGroups.get(gate) ?? [];
					const visible = groupPlayers.slice(0, MAX_VISIBLE_AVATARS);
					const overflow = groupPlayers.length - visible.length;
					const leftPercent = computeTrackPosition(gate, leaderGate);

					return (
						<div
							key={gate}
							className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center"
							style={{ left: `${leftPercent}%` }}
						>
							<div className="flex flex-col-reverse items-center -space-y-1 -space-y-reverse">
								{overflow > 0 && (
									<span
										className={clsx(
											"inline-flex h-6 w-6 items-center justify-center",
											"rounded-full bg-zinc-700 text-xs text-white",
											"ring-2 ring-zinc-900"
										)}
									>
										+{overflow}
									</span>
								)}
								{visible.map((player) => (
									<UserAvatar key={player.id} user={player} size="sm" />
								))}
							</div>
							<span className="mt-2 text-xs text-zinc-400">Gate {gate}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default GatesMinimap;
