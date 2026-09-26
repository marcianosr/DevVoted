import { useEffect, useState } from "react";

type MeasuredBox = { borderBoxSize: readonly { blockSize: number }[] };

const heightOf = (box: MeasuredBox): number =>
	Math.ceil(box.borderBoxSize[0]?.blockSize ?? 0);

export const useBarHeight = (): [
	(bar: HTMLElement | null) => void,
	number | undefined,
] => {
	const [bar, setBar] = useState<HTMLElement | null>(null);
	const [height, setHeight] = useState<number>();

	useEffect(() => {
		if (bar === null) return;

		const observer = new ResizeObserver((entries) => {
			const measured = entries.at(-1);
			if (measured === undefined) return;

			setHeight(heightOf(measured));
		});

		observer.observe(bar, { box: "border-box" });
		return () => observer.disconnect();
	}, [bar]);

	return [setBar, height];
};
