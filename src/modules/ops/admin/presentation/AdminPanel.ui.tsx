import type { ReactNode } from "react";

import type {
	AdminDormant,
	AdminPanelData,
	AdminTopValue,
	AdminUser,
	AdminVisit,
} from "~/modules/ops/admin/application/adminPanel.viewmodel";

const COPY = {
	title: "DevVoted Admin Panel",
	intro: "Who comes, where they go, who stays, and what the poll pool holds.",
	loading: "Loading the admin panel…",
	status: "System Status",
	database: "Database",
	connected: "Connected",
	activeRuns: "Active Runs",
	totalUsers: "Total Users",
	poll: (id: number) => `Poll #${id}`,
	recentResponses: "Recent Responses",
	noResponses: "No recent responses.",
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
	visitBreakdown: "Visitors, last 7 days",
	signedIn: "Signed in",
	anonymous: "Anonymous",
	total: "Total",
	devices: "Devices",
	countries: "Countries",
	referrers: "Referrers",
	visitors: "Visitors",
	routeTraffic: "Route traffic",
	today: "Today",
	dailyAverage: "7-day avg",
	signups: "Signups & retention",
	accounts: "New accounts",
	nextDay: "Back the next day",
	firstWeek: "Back within a week",
	pollPool: "Poll pool",
	category: "Category",
	published: "Published",
	drafts: "Drafts",
	neverDealt: "Never dealt",
	dormant: (count: number) => `Dormant players (${count})`,
	noDormant: "Nobody has gone quiet.",
	nothingYet: "Nothing yet.",
} as const;

const PAGE = "container mx-auto px-4 py-8";
const CARD = " rounded-lg shadow-md p-6";
const CARD_TITLE = "text-xl font-bold mb-4 text-white";
const GRID = "grid grid-cols-1 lg:grid-cols-2 gap-8";
const TH = "text-left py-2 px-3 font-bold text-white";
const TD = "py-2 px-3 text-white text-xs whitespace-nowrap";
const SUBGRID = "grid grid-cols-1 gap-6 md:grid-cols-3";
const SUBTITLE = "text-sm font-bold uppercase tracking-wide text-white mb-3";
const ROW = "border-b border-gray-700 hover:bg-gray-800";
const FIGURE_TD = "py-2 px-3 text-white text-xs tabular-nums text-right";
const FIGURE_TH = "text-right py-2 px-3 font-bold text-white";
const FIGURE_ROW = "flex justify-between items-center";
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
		<h3 className="text-sm font-bold uppercase tracking-wide text-white mb-3">
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
							<p className="text-sm font-bold text-white truncate">
								{user.displayName}
							</p>
							<p className="text-xs text-white truncate">{user.email}</p>
							<p className="text-xs text-white">
								{COPY.pollsSubmitted(user.pollsSubmitted)}
							</p>
						</div>
						<ReminderButton
							user={user}
							sendingTo={sendingTo}
							sentTo={sentTo}
							onSendReminder={onSendReminder}
						/>
					</li>
				))}
			</ul>
		)}
	</div>
);

type Column<Row> = {
	head: string;
	cell: (row: Row) => ReactNode;
	figure?: boolean;
};

type TableProps<Row> = {
	rows: readonly Row[];
	keyOf: (row: Row) => string;
	columns: readonly Column<Row>[];
};

const Table = <Row,>({ rows, keyOf, columns }: TableProps<Row>) =>
	rows.length === 0 ? (
		<p className="text-white text-sm">{COPY.nothingYet}</p>
	) : (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-gray-600">
						{columns.map((column) => (
							<th
								key={column.head}
								className={column.figure === true ? FIGURE_TH : TH}
							>
								{column.head}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={keyOf(row)} className={ROW}>
							{columns.map((column) => (
								<td
									key={column.head}
									className={column.figure === true ? FIGURE_TD : TD}
								>
									{column.cell(row)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);

const TopValues = ({
	title,
	values,
}: {
	title: string;
	values: readonly AdminTopValue[];
}) => (
	<div>
		<h3 className={SUBTITLE}>{title}</h3>
		<Table
			rows={values}
			keyOf={(value) => value.label}
			columns={[
				{ head: title, cell: (value) => value.label },
				{ head: COPY.visitors, cell: (value) => value.visitors, figure: true },
			]}
		/>
	</div>
);

const VisitBreakdown = ({
	visitBreakdown,
}: Pick<AdminPanelData, "visitBreakdown">) => (
	<div className={`mt-8${CARD}`}>
		<h2 className={CARD_TITLE}>{COPY.visitBreakdown}</h2>
		<Table
			rows={visitBreakdown.days}
			keyOf={(day) => day.date}
			columns={[
				{ head: COPY.date, cell: (day) => day.date },
				{ head: COPY.signedIn, cell: (day) => day.signedIn, figure: true },
				{ head: COPY.anonymous, cell: (day) => day.anonymous, figure: true },
				{ head: COPY.total, cell: (day) => day.total, figure: true },
			]}
		/>
		<div className={`mt-6 ${SUBGRID}`}>
			<TopValues title={COPY.devices} values={visitBreakdown.devices} />
			<TopValues title={COPY.countries} values={visitBreakdown.countries} />
			<TopValues title={COPY.referrers} values={visitBreakdown.referrers} />
		</div>
	</div>
);

const RouteTraffic = ({
	routeTraffic,
}: Pick<AdminPanelData, "routeTraffic">) => (
	<div className={CARD}>
		<h2 className={CARD_TITLE}>{COPY.routeTraffic}</h2>
		<Table
			rows={routeTraffic}
			keyOf={(route) => route.route}
			columns={[
				{ head: COPY.route, cell: (route) => route.route },
				{ head: COPY.today, cell: (route) => route.today, figure: true },
				{
					head: COPY.dailyAverage,
					cell: (route) => route.average,
					figure: true,
				},
			]}
		/>
	</div>
);

const Signups = ({ signups }: Pick<AdminPanelData, "signups">) => (
	<div className={CARD}>
		<h2 className={CARD_TITLE}>{COPY.signups}</h2>
		<div className="space-y-3 mb-6">
			<div className={FIGURE_ROW}>
				<span className="text-white">{COPY.nextDay}</span>
				<span className="text-white font-bold">{signups.nextDay}</span>
			</div>
			<div className={FIGURE_ROW}>
				<span className="text-white">{COPY.firstWeek}</span>
				<span className="text-white font-bold">{signups.firstWeek}</span>
			</div>
		</div>
		<Table
			rows={signups.days}
			keyOf={(day) => day.date}
			columns={[
				{ head: COPY.date, cell: (day) => day.date },
				{ head: COPY.accounts, cell: (day) => day.count, figure: true },
			]}
		/>
	</div>
);

const PollPool = ({ pollPool }: Pick<AdminPanelData, "pollPool">) => (
	<div className={`mt-8${CARD}`}>
		<h2 className={CARD_TITLE}>{COPY.pollPool}</h2>
		<Table
			rows={pollPool}
			keyOf={(row) => row.category}
			columns={[
				{ head: COPY.category, cell: (row) => row.category },
				{ head: COPY.published, cell: (row) => row.published, figure: true },
				{ head: COPY.drafts, cell: (row) => row.drafts, figure: true },
				{ head: COPY.neverDealt, cell: (row) => row.neverDealt, figure: true },
			]}
		/>
	</div>
);

type DormantProps = Pick<
	AdminPanelProps,
	"dormant" | "sendingTo" | "sentTo" | "onSendReminder"
>;

const ReminderButton = ({
	user,
	sendingTo,
	sentTo,
	onSendReminder,
}: Omit<DormantProps, "dormant"> & { user: AdminUser }) => (
	<button
		type="button"
		onClick={() => onSendReminder(user)}
		disabled={sendingTo === user.id || sentTo.has(user.id)}
		className="shrink-0 px-3 py-1.5 text-xs rounded-md transition-colors disabled:opacity-50 bg-indigo-600 hover:bg-indigo-700 text-white disabled:cursor-not-allowed"
	>
		{reminderLabelOf(user, sendingTo, sentTo)}
	</button>
);

const Dormant = ({ dormant, ...reminder }: DormantProps) => (
	<div className={`mt-8${CARD}`}>
		<h2 className={CARD_TITLE}>{COPY.dormant(dormant.length)}</h2>
		{dormant.length === 0 ? (
			<p className="text-white text-sm">{COPY.noDormant}</p>
		) : (
			<Table<AdminDormant>
				rows={dormant}
				keyOf={(user) => user.id}
				columns={[
					{ head: COPY.visitor, cell: (user) => user.displayName },
					{ head: COPY.lastSeen, cell: (user) => user.lastSeen },
					{
						head: COPY.sendReminder,
						cell: (user) => <ReminderButton user={user} {...reminder} />,
					},
				]}
			/>
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
			<p className="text-sm font-bold text-white truncate">{visit.name}</p>
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
	recentResponses,
	users,
	visits,
	visitBreakdown,
	routeTraffic,
	signups,
	pollPool,
	dormant,
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
						<span className="text-white font-bold">{stats.activeRuns}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-white">{COPY.totalUsers}</span>
						<span className="text-white font-bold">{stats.totalUsers}</span>
					</div>
				</div>
			</div>

			<div className={CARD}>
				<h2 className={CARD_TITLE}>{COPY.recentResponses}</h2>
				{recentResponses.length > 0 ? (
					<div className="space-y-2 max-h-96 overflow-y-auto">
						{recentResponses.map((response) => (
							<div key={response.id} className="p-3 bg-gray-800 rounded-lg">
								<div className="flex justify-between items-start mb-1">
									<span className="font-bold text-sm text-white">
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

			<Signups signups={signups} />
			<RouteTraffic routeTraffic={routeTraffic} />
		</div>

		<VisitBreakdown visitBreakdown={visitBreakdown} />

		<div className={`mt-8${CARD}`}>
			<h2 className={CARD_TITLE}>{COPY.visits(visits.length)}</h2>
			{visits.length > 0 ? (
				<VisitsTable visits={visits} />
			) : (
				<p className="text-white">{COPY.noVisits}</p>
			)}
		</div>

		<PollPool pollPool={pollPool} />

		<Dormant
			dormant={dormant}
			sendingTo={sendingTo}
			sentTo={sentTo}
			onSendReminder={onSendReminder}
		/>

		<div className={`mt-8${CARD}`}>
			<h2 className="text-xl font-bold mb-6 text-white">
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
