import { Link } from "@tanstack/react-router";

import ActiveCard from "~/domains/configs/components/Cards/ActiveCard";
import { Config } from "~/domains/configs/models/config";

type ShopPreviewProps = {
	offeredConfigs: (Config & { originalCost?: number })[];
};

export const ShopPreview = ({ offeredConfigs }: ShopPreviewProps) => (
	<div className="fixed bottom-0 left-0 right-0 bg-zinc-900 p-4 border-t border-white ">
		<details open className="group">
			<summary className="cursor-pointer list-none">
				<section className="grid grid-cols-4 gap-4 mb-2 justify-between items-center">
					<header className="col-span-3">
						<h2 className="text-md md:text-2xl">Upgrade your run!</h2>
						<small className="text-gray-300 text-xs md:text-lg">
							Shop offers for the next polls
						</small>
					</header>
					<span className="col-span-1 text-right text-sm text-gray-400">
						<span className="group-open:hidden">open ▼</span>
						<span className="hidden group-open:inline">fold ▲</span>
					</span>
				</section>
			</summary>
			<div className="flex gap-2 overflow-auto">
				{offeredConfigs.map((config) => (
					<ActiveCard key={config.id} config={config} size="small" />
				))}
			</div>
			<div className="mt-4">
				<Link
					to="/progress"
					className="border-solid border-2 text-white text-sm px-1 py-1 md:px-2 md:py-2 w-full md:w-1/3 text-center btn-color-cycle mt-4 block"
				>
					Go to progress & shop →
				</Link>
			</div>
		</details>
	</div>
);
