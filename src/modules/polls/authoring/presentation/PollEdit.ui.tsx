const COPY = {
	accessDenied: "Access Denied",
	adminOnly: "This area is restricted to administrators only.",
	loadError: "Error loading poll",
	loading: "Loading poll...",
} as const;

const PAGE = "max-w-3xl mx-auto p-4";

export const PollEditLoading = () => (
	<div className={PAGE}>
		<div className="animate-pulse">{COPY.loading}</div>
	</div>
);

export const PollEditDenied = () => (
	<div className="flex items-center justify-center min-h-screen">
		<div className="text-center">
			<h1 className="text-2xl text-cinnabar mb-4">{COPY.accessDenied}</h1>
			<p>{COPY.adminOnly}</p>
		</div>
	</div>
);

export const PollEditError = ({ message }: { message: string }) => (
	<div className={PAGE}>
		<h1 className="text-cinnabar text-3xl">{COPY.loadError}</h1>
		<p className="text-gray-400 mt-2">{message}</p>
	</div>
);
