import type {
	AdminPanelData,
	AdminUser,
	AdminVisit,
} from "~/modules/ops/admin/application/adminPanel.viewmodel";

const COPY = {
	title: "DevVoted Admin Panel",
	intro: "Monitor active polls and track user responses.",
	loading: "Loading the admin panel…",
	status: "System Status",
	database: "Database",
	connected: "Connected",
	activeRuns: "Active Runs",
	totalUsers: "Total Users",
	activePolls: "Active Polls",
	noActivePolls: "No active polls currently.",
	poll: (id: number) => `Poll #${id}`,
	opens: "Opens:",
	closes: "Closes:",
	recentResponses: "Recent Responses",
	noResponses: "No recent responses.",
	pastPolls: (count: number) => `Past Daily Polls (${count})`,
	noPastPolls: "No past polls yet.",
	pollId: "Poll ID",
	question: "Question",
	category: "Category",
	timesUsed: "Times used",
	lastShown: "Last shown",
	allDates: "All dates",
	users: (count: number) => `Users (${count})`,
	inRun: "In Active Run",
	idle: "No Active Run",
	none: "None",
	pollsSubmitted: (count: number) => `${count} polls submitted`,
	sending: "Sending...",
	sent: "Sent ✓",
	sendReminder: "Send reminder",
	visits: (count: number) => `Visits (${count}, last seen first)`,
	noVisits: "No visits yet.",
	visitor: "Visitor",
	lastSeen: "Last seen",
	firstSeen: "First seen",
	date: "Date",
	route: "Route",
	hits: "Hits",
	device: "Device",
	country: "Country",
	referrer: "Referrer",
} as const;

const PAGE = "container mx-auto px-4 py-8";
const CARD = " rounded-lg shadow-md p-6";
const CARD_TITLE = "text-xl font-semibold mb-4 text-white";
const GRID = "grid grid-cols-1 lg:grid-cols-2 gap-8";
const TH = "text-left py-2 px-3 font-medium text-white";
const TD = "py-2 px-3 text-white text-xs whitespace-nowrap";
const AVATAR = "size-8 shrink-0 rounded-full bg-gray-700 object-cover";
const ERROR_BOX = "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg";
const MESSAGE_BOX = {
	success:
		"mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-600",
	error: "mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600",
} as const;

export type AdminMessage = {
	readonly type: keyof typeof MESSAGE_BOX;
	readonly text: string;
};

export type AdminPanelProps = AdminPanelData & {
	message?: AdminMessage;
	sendingTo: string | null;
	sentTo: ReadonlySet<string>;
	onSendReminder: (user: AdminUser) => void;
};

export const AdminPanelLoading = () => (
	<div className={PAGE}>
		<p className="text-white">{COPY.loading}</p>
	</div>
);

export const AdminPanelError = ({ message }: { message: string }) => (
	<div className={PAGE}>
		<div className={ERROR_BOX}>
			<p className="text-red-600">{message}</p>
		</div>
	</div>
);

const reminderLabelOf = (
	user: AdminUser,
	sendingTo: string | null,
	sentTo: ReadonlySet<string>
): string => {
	if (sendingTo === user.id) return COPY.sending;
	if (sentTo.has(user.id)) return COPY.sent;
	return COPY.sendReminder;
};

type UserGroupProps = Pick<
	AdminPanelProps,
	"sendingTo" | "sentTo" | "onSendReminder"
> & {
	title: string;
	users: readonly AdminUser[];
};

const UserGroup = ({
	title,
	users,
	sendingTo,
	sentTo,
	onSendReminder,
}: UserGroupProps) => (
	<div>
		<h3 className="text-sm font-semibold uppercase tracking-wide text-white mb-3">
			{title} ({users.length})
		</h3>
		{users.length === 0 ? (
			<p className="text-white text-sm">{COPY.none}</p>
		) : (
			<ul className="space-y-2">
				{users.map((user) => (
					<li
						key={user.id}
						className="flex items-center justify-between gap-3 p-3 bg-gray-800 rounded-lg"
					>
						<div className="min-w-0">
							<p className="text-sm font-medium text-white truncate">
								{user.displayName}
							</p>
							<p className="text-xs text-white truncate">{user.email}</p>
							<p className="text-xs text-white">
								{COPY.pollsSubmitted(user.pollsSubmitted)}
							</p>
						</div>
						<button
							type="button"
							onClick={() => onSendReminder(user)}
							disabled={sendingTo === user.id || sentTo.has(user.id)}
							className="shrink-0 px-3 py-1.5 text-xs rounded-md transition-colors disabled:opacity-50 bg-indigo-600 hover:bg-indigo-700 text-white disabled:cursor-not-allowed"
						>
							{reminderLabelOf(user, sendingTo, sentTo)}
						</button>
					</li>
				))}
			</ul>
		)}
	</div>
);

const VisitorCell = ({ visit }: { visit: AdminVisit }) => (
	<div className="flex items-center gap-2">
		{visit.avatarUrl === null ? (
			<span className={AVATAR} aria-hidden="true" />
		) : (
			<img src={visit.avatarUrl} alt="" className={AVATAR} />
		)}
		<div className="min-w-0">
			<p className="text-sm font-medium text-white truncate">{visit.name}</p>
			<p className="text-xs text-gray-400 font-mono">{visit.visitor}</p>
		</div>
	</div>
);

const VisitsTable = ({ visits }: { visits: readonly AdminVisit[] }) => (
	<div className="overflow-x-auto">
		<table className="w-full text-sm">
			<thead>
				<tr className="border-b border-gray-600">
					<th className={TH}>{COPY.visitor}</th>
					<th className={TH}>{COPY.lastSeen}</th>
					<th className={TH}>{COPY.firstSeen}</th>
					<th className={TH}>{COPY.date}</th>
					<th className={TH}>{COPY.route}</th>
					<th className={TH}>{COPY.hits}</th>
					<th className={TH}>{COPY.device}</th>
					<th className={TH}>{COPY.country}</th>
					<th className={TH}>{COPY.referrer}</th>
				</tr>
			</thead>
			<tbody>
				{visits.map((visit) => (
					<tr
						key={visit.id}
						className="border-b border-gray-700 hover:bg-gray-800"
					>
						<td className="py-2 px-3">
							<VisitorCell visit={visit} />
						</td>
						<td className={TD}>{visit.lastSeen}</td>
						<td className={TD}>{visit.firstSeen}</td>
						<td className={TD}>{visit.date}</td>
						<td className={TD}>{visit.route}</td>
						<td className={TD}>{visit.hits}</td>
						<td className={TD}>{visit.device}</td>
						<td className={TD}>{visit.country}</td>
						<td className={TD}>{visit.referrer}</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

export const AdminPanel = ({
	stats,
	activePolls,
	recentResponses,
	pastPolls,
	users,
	visits,
	message,
	sendingTo,
	sentTo,
	onSendReminder,
}: AdminPanelProps) => (
	<div className={PAGE}>
		<div className="mb-8">
			<h1 className="text-3xl text-white mb-2">{COPY.title}</h1>
			<p className="text-white">{COPY.intro}</p>
		</div>

		{message === undefined ? null : (
			<div className={MESSAGE_BOX[message.type]}>
				<p>{message.text}</p>
			</div>
		)}

		<div className={GRID}>
			<div className={CARD}>
				<h2 className={CARD_TITLE}>{COPY.status}</h2>
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<span className="text-white">{COPY.database}</span>
						<span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
							{COPY.connected}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-white">{COPY.activeRuns}</span>
						<span className="text-white font-medium">{stats.activeRuns}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-white">{COPY.totalUsers}</span>
						<span className="text-white font-medium">{stats.totalUsers}</span>
					</div>
				</div>
			</div>

			<div className={CARD}>
				<h2 className={CARD_TITLE}>{COPY.activePolls}</h2>
				{activePolls.length > 0 ? (
					<div className="space-y-3">
						{activePolls.map((poll) => (
							<div
								key={poll.id}
								className="p-3 border border-gray-200 rounded-lg"
							>
								<div className="flex justify-between items-start mb-2">
									<h3 className="font-medium text-white">
										{COPY.poll(poll.id)}
									</h3>
									<span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
										{poll.category}
									</span>
								</div>
								<p className="text-sm text-white mb-2">{poll.question}</p>
								<div className="flex justify-between text-xs text-white">
									<span>
										{COPY.opens} {poll.opens}
									</span>
									<span>
										{COPY.closes} {poll.closes}
									</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-white">{COPY.noActivePolls}</p>
				)}
			</div>

			<div className={CARD}>
				<h2 className={CARD_TITLE}>{COPY.recentResponses}</h2>
				{recentResponses.length > 0 ? (
					<div className="space-y-2 max-h-96 overflow-y-auto">
						{recentResponses.map((response) => (
							<div key={response.id} className="p-3 bg-gray-50 rounded-lg">
								<div className="flex justify-between items-start mb-1">
									<span className="font-medium text-sm text-white">
										{response.name}
									</span>
									<span className="text-xs text-white">{response.at}</span>
								</div>
								<p className="text-xs text-white mb-1">
									{COPY.poll(response.pollId)}: {response.question}
								</p>
								{response.email === null ? null : (
									<p className="text-xs text-white">{response.email}</p>
								)}
							</div>
						))}
					</div>
				) : (
					<p className="text-white">{COPY.noResponses}</p>
				)}
			</div>
		</div>

		<div className={`mt-8${CARD}`}>
			<h2 className={CARD_TITLE}>{COPY.visits(visits.length)}</h2>
			{visits.length > 0 ? (
				<VisitsTable visits={visits} />
			) : (
				<p className="text-white">{COPY.noVisits}</p>
			)}
		</div>

		<div className={`mt-8${CARD}`}>
			<h2 className={CARD_TITLE}>{COPY.pastPolls(pastPolls.length)}</h2>
			{pastPolls.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-600">
								<th className={TH}>{COPY.pollId}</th>
								<th className={TH}>{COPY.question}</th>
								<th className={TH}>{COPY.category}</th>
								<th className={TH}>{COPY.timesUsed}</th>
								<th className={TH}>{COPY.lastShown}</th>
								<th className={TH}>{COPY.allDates}</th>
							</tr>
						</thead>
						<tbody>
							{pastPolls.map((poll) => (
								<tr
									key={poll.pollId}
									className="border-b border-gray-700 hover:bg-gray-800"
								>
									<td className="py-2 px-3 text-white text-xs">
										#{poll.pollId}
									</td>
									<td className="py-2 px-3 text-white max-w-sm">
										{poll.question}
									</td>
									<td className="py-2 px-3">
										<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
											{poll.category}
										</span>
									</td>
									<td className="py-2 px-3 text-center">
										<span
											className={
												poll.occurrences > 1
													? "px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800"
													: "px-2 py-1 rounded text-xs font-medium bg-gray-700 text-white"
											}
										>
											{poll.occurrences}×
										</span>
									</td>
									<td className="py-2 px-3 text-white text-xs whitespace-nowrap">
										{poll.lastShown}
									</td>
									<td className="py-2 px-3 text-white text-xs">
										{poll.allDates}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-white">{COPY.noPastPolls}</p>
			)}
		</div>

		<div className={`mt-8${CARD}`}>
			<h2 className="text-xl font-semibold mb-6 text-white">
				{COPY.users(users.inRun.length + users.idle.length)}
			</h2>
			<div className={GRID}>
				<UserGroup
					title={COPY.inRun}
					users={users.inRun}
					sendingTo={sendingTo}
					sentTo={sentTo}
					onSendReminder={onSendReminder}
				/>
				<UserGroup
					title={COPY.idle}
					users={users.idle}
					sendingTo={sendingTo}
					sentTo={sentTo}
					onSendReminder={onSendReminder}
				/>
			</div>
		</div>
	</div>
);
