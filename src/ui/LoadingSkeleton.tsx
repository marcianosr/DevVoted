export const LoadingSkeleton = () => (
	<div className="p-4">
		<div className="animate-pulse flex flex-col gap-4">
			<div className="h-8 rounded w-3/4"></div>
			<div className="h-4 rounded w-1/2"></div>
			<div className="h-24 rounded w-full"></div>
		</div>
	</div>
);
