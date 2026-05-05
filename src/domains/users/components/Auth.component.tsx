import { SecondaryButton } from "~/ui/SecondaryButton.component";

const isDevelopment = process.env.NODE_ENV === "development";

export function Auth({
	actionText,
	subTitle,
	onSubmit,
	status,
	afterSubmit,
}: {
	actionText: string;
	subTitle?: string;
	onSubmit: (e: React.FormEvent) => void;
	status: "pending" | "idle" | "success" | "error";
	afterSubmit?: React.ReactNode;
}) {
	return (
		<div className="text-white inset-0 flex items-start justify-center p-8 ">
			<div className="p-8 rounded-lg shadow-lg">
				<h1 className="text-2xl">{actionText}</h1>
				<h2 className="text-gray-400 mb-4">{subTitle}</h2>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit(e);
					}}
					className="space-y-4"
				>
					{isDevelopment && (
						<>
							<div>
								<label htmlFor="email" className="block text-xs">
									Username
								</label>
								<input
									type="email"
									name="email"
									id="email"
									className="px-2 py-1 w-full rounded border border-gray-500/20 dark:bg-gray-800"
								/>
							</div>
							<div>
								<label htmlFor="password" className="block text-xs">
									Password
								</label>
								<input
									type="password"
									name="password"
									id="password"
									className="px-2 py-1 w-full rounded border border-gray-500/20 dark:bg-gray-800"
								/>
							</div>
							<SecondaryButton
								type="submit"
								className="w-full bg-cyan-600 text-white font-black uppercase"
								disabled={status === "pending"}
							>
								{status === "pending" ? "..." : actionText}
							</SecondaryButton>
						</>
					)}
					{afterSubmit ? afterSubmit : null}
				</form>
			</div>
		</div>
	);
}
