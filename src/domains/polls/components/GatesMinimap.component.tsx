import { useState } from "react";

import { clsx } from "clsx";

import type {
	ActiveRunPlayer,
	FallenRunPlayer,
} from "~/domains/polls/api/communityStats.queries";
import FallenPlayerModal from "~/domains/polls/components/FallenPlayerModal.component";
import UserAvatar from "~/domains/users/components/UserAvatar.component";

type GatesMinimapProps = {
	players: ActiveRunPlayer[];
	fallenPlayers?: FallenRunPlayer[];
	viewerUserId?: string | null;
};

const MAX_VISIBLE_AVATARS = 4;
const TRACK_LEFT_MARGIN = 5;
const TRACK_RIGHT_MARGIN = 5;

const groupByGate = <T extends { currentGate: number }>(
	items: T[]
): Map<number, T[]> =>
	items.reduce<Map<number, T[]>>((acc, item) => {
		const existing = acc.get(item.currentGate) ?? [];
		acc.set(item.currentGate, [...existing, item]);
		return acc;
	}, new Map());

const computeTrackPosition = (gate: number, leaderGate: number): number => {
	const usableRange = 100 - TRACK_LEFT_MARGIN - TRACK_RIGHT_MARGIN;
	const denom = Math.max(leaderGate - 1, 1);
	const fraction = (gate - 1) / denom;
	return TRACK_LEFT_MARGIN + fraction * usableRange;
};

const formatTimeOfDay = (date: Date): string =>
	date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

type FallenAvatarProps = {
	player: FallenRunPlayer;
	onSelect: (player: FallenRunPlayer) => void;
};

const FallenAvatar = ({ player, onSelect }: FallenAvatarProps) => {
	const isLooted = player.lootedBy !== null;
	return (
		<button
			type="button"
			onClick={() => onSelect(player)}
			className="relative cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
			title={`${player.displayName} fell at Gate ${player.currentGate} · ${formatTimeOfDay(player.finishedAt)}${isLooted ? ` · looted by ${player.lootedBy?.displayName}` : ""}`}
			aria-label={`See why ${player.displayName} died`}
		>
			<div className="grayscale opacity-60">
				<UserAvatar user={player} size="sm" />
			</div>
			{isLooted && player.lootedBy ? (
				<span
					className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-zinc-900 overflow-hidden bg-zinc-800"
					aria-hidden="true"
				>
					<UserAvatar user={player.lootedBy} size="xs" />
				</span>
			) : (
				<span
					className={clsx(
						"absolute -bottom-1 -right-1 inline-flex h-4 w-4",
						"items-center justify-center rounded-full bg-red-600",
						"text-[10px] leading-none ring-2 ring-zinc-900"
					)}
					aria-hidden="true"
				>
					💀
				</span>
			)}
		</button>
	);
};

const GatesMinimap = ({
	players,
	fallenPlayers = [],
	viewerUserId = null,
}: GatesMinimapProps) => {
	const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
	const selectedFallen =
		fallenPlayers.find((p) => p.runId === selectedRunId) ?? null;

	if (players.length === 0 && fallenPlayers.length === 0) return null;

	const allGates = [
		...players.map((p) => p.currentGate),
		...fallenPlayers.map((p) => p.currentGate),
	];
	const leaderGate = Math.max(...allGates);
	const liveGroups = groupByGate(players);
	const fallenGroups = groupByGate(fallenPlayers);
	const sortedGates = [
		...new Set([...liveGroups.keys(), ...fallenGroups.keys()]),
	].sort((a, b) => a - b);

	return (
		<>
			<div className="mt-4">
				<p className="text-xl">
					{players.length} player(s) currently in a run
					{fallenPlayers.length > 0 && (
						<span className="text-zinc-400 text-base ml-2">
							· {fallenPlayers.length} fell today
						</span>
					)}
				</p>
				<div className="relative mt-4 h-52">
					<div
						className={clsx(
							"absolute left-0 right-0 top-24 h-1",
							"rounded-full bg-gradient-to-r",
							"from-zinc-700 via-zinc-500 to-zinc-700"
						)}
					/>

					{sortedGates.map((gate) => {
						const live = liveGroups.get(gate) ?? [];
						const fallen = fallenGroups.get(gate) ?? [];
						const visibleLive = live.slice(0, MAX_VISIBLE_AVATARS);
						const liveOverflow = live.length - visibleLive.length;
						const visibleFallen = fallen.slice(0, MAX_VISIBLE_AVATARS);
						const fallenOverflow = fallen.length - visibleFallen.length;
						const leftPercent = computeTrackPosition(gate, leaderGate);

						return (
							<div
								key={gate}
								className="absolute top-0 bottom-0 flex -translate-x-1/2 flex-col items-center"
								style={{ left: `${leftPercent}%` }}
							>
								<div className="h-24 flex flex-col-reverse items-center justify-start -space-y-1 -space-y-reverse">
									{liveOverflow > 0 && (
										<span
											className={clsx(
												"inline-flex h-6 w-6 items-center justify-center",
												"rounded-full bg-zinc-700 text-xs text-white",
												"ring-2 ring-zinc-900"
											)}
										>
											+{liveOverflow}
										</span>
									)}
									{visibleLive.map((player) => (
										<UserAvatar key={player.id} user={player} size="sm" />
									))}
								</div>
								<span className="mt-2 text-xs text-zinc-400">Gate {gate}</span>
								<div className="mt-2 flex flex-col items-center space-y-1">
									{visibleFallen.map((player) => (
										<FallenAvatar
											key={player.id}
											player={player}
											onSelect={(p) => setSelectedRunId(p.runId)}
										/>
									))}
									{fallenOverflow > 0 && (
										<span
											className={clsx(
												"inline-flex h-6 w-6 items-center justify-center",
												"rounded-full bg-red-900/70 text-xs text-white",
												"ring-2 ring-zinc-900"
											)}
										>
											+{fallenOverflow}
										</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
			<FallenPlayerModal
				player={selectedFallen}
				viewerUserId={viewerUserId}
				onClose={() => setSelectedRunId(null)}
			/>
		</>
	);
};

export default GatesMinimap;
