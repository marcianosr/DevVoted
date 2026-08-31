import { useState } from "react";

import { clsx } from "clsx";

import { Subtitle } from "~/ui/typography/Subtitle.component";

type Step = {
	icon: string;
	title: string;
	description: string;
};

const GAME_LOOP_STEPS: Step[] = [
	{
		icon: "1.",
		title: "Answer Polls",
		description:
			"Each day a new developer quiz drops. Answer it to earn coverage and keep your run alive.",
	},
	{
		icon: "2.",
		title: "Build Coverage",
		description:
			"Correct answers earn coverage %. Wrong answers lose %. Streak bonuses multiply your gains.",
	},
	{
		icon: "3.",
		title: "Clear the Gates",
		description:
			"Every 5 polls a gate audits your score. Earn its coverage demand to clear it — miss it and the gate peels a config before you try again.",
	},
	{
		icon: "4.",
		title: "Upgrade Your Build",
		description:
			"Clear a gate to earn storage and a wider build, then spend it on configs that boost your coverage.",
	},
	{
		icon: "5.",
		title: "Shop for Power-ups",
		description:
			"After each poll, visit the Package Manager to install configs that boost your coverage or bend the rules.",
	},
];

export const GameLoopExplainer = () => {
	const [currentStep, setCurrentStep] = useState(0);

	const goToNext = () => {
		setCurrentStep((prev) => Math.min(prev + 1, GAME_LOOP_STEPS.length - 1));
	};

	const goToPrev = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 0));
	};

	const currentStepData = GAME_LOOP_STEPS[currentStep];
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === GAME_LOOP_STEPS.length - 1;

	return (
		<div className="mb-8 border border-edge-strong p-6">
			<Subtitle as="p" className="mb-4 uppercase tracking-wider">
				How the game works
			</Subtitle>

			<div className="min-h-[30]">
				<div className="flex items-start gap-4">
					<span className="text-3xl text-saffron font-bold">
						{currentStepData.icon}
					</span>
					<div>
						<h4 className="text-xl text-white mb-2">{currentStepData.title}</h4>
						<p className="text-zinc-200">{currentStepData.description}</p>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between mt-6">
				<button
					onClick={goToPrev}
					disabled={isFirstStep}
					className={clsx(
						"px-4 py-2 text-sm border border-control-edge",
						isFirstStep
							? "text-pewter cursor-not-allowed"
							: "text-white hover:border-white cursor-pointer"
					)}
				>
					Previous
				</button>

				<div className="flex gap-2">
					{GAME_LOOP_STEPS.map((_, index) => (
						<button
							key={index}
							onClick={() => setCurrentStep(index)}
							className={clsx(
								"w-3 h-3 rounded-full transition-colors cursor-pointer",
								index === currentStep
									? "bg-saffron"
									: "bg-zinc-600 hover:bg-zinc-500"
							)}
							aria-label={`Go to step ${index + 1}`}
						/>
					))}
				</div>

				<button
					onClick={goToNext}
					disabled={isLastStep}
					className={clsx(
						"px-4 py-2 text-sm border border-control-edge",
						isLastStep
							? "text-pewter cursor-not-allowed"
							: "text-white hover:border-white cursor-pointer"
					)}
				>
					Next
				</button>
			</div>
		</div>
	);
};
