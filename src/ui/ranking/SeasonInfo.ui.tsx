type SeasonInfoProps = {
	name: string;
	daysRemaining: number;
};

export const SeasonInfo = ({ name, daysRemaining }: SeasonInfoProps) => (
	<div>
		<h3 className="text-lg font-semibold text-theme mb-2">{name}</h3>
		<div className="text-xs text-white">
			{daysRemaining === 0 ? (
				<span className="text-red-400">Ends today!</span>
			) : daysRemaining === 1 ? (
				<span className="text-yellow-400">Ends in 1 day</span>
			) : (
				<span>Ends in {daysRemaining} days</span>
			)}
		</div>
	</div>
);
