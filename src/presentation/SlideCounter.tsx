type SlideCounterProps = {
	current: number;
	total: number;
};

export const SlideCounter = ({ current, total }: SlideCounterProps) => {
	return (
		<div className="fixed bottom-6 right-44 text-sm text-gray-400 font-mono">
			{current} / {total}
		</div>
	);
};
