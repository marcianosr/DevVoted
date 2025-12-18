import { useState } from "react";

import { clsx } from "clsx";

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
			"Each day, a new developer quiz appears in a category. Pick the right answer!",
	},
	{
		icon: "2.",
		title: "Build Coverage",
		description:
			"Correct answers earn coverage %. Wrong answers lose %. Track your score per category.",
	},
	{
		icon: "3.",
		title: "Pass Checkpoints",
		description:
			"CI Gates are checkpoints throughout your run. Meet the coverage target to continue!",
	},
	{
		icon: "4.",
		title: "Shop for Power-ups",
		description:
			"After each poll, visit the Package Manager to install configs that boost your coverage.",
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
		<div className="mb-8 border border-gray-700 p-6">
			<p className="text-gray-400 text-sm mb-4 uppercase tracking-wider">
				How the game works
			</p>

			<div className="min-h-[30]">
				<div className="flex items-start gap-4">
					<span className="text-3xl text-yellow-500 font-bold">
						{currentStepData.icon}
					</span>
					<div>
						<h4 className="text-xl text-white mb-2">{currentStepData.title}</h4>
						<p className="text-gray-300">{currentStepData.description}</p>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between mt-6">
				<button
					onClick={goToPrev}
					disabled={isFirstStep}
					className={clsx(
						"px-4 py-2 text-sm border border-gray-600",
						isFirstStep
							? "text-gray-600 cursor-not-allowed"
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
									? "bg-yellow-500"
									: "bg-gray-600 hover:bg-gray-500"
							)}
							aria-label={`Go to step ${index + 1}`}
						/>
					))}
				</div>

				<button
					onClick={goToNext}
					disabled={isLastStep}
					className={clsx(
						"px-4 py-2 text-sm border border-gray-600",
						isLastStep
							? "text-gray-600 cursor-not-allowed"
							: "text-white hover:border-white cursor-pointer"
					)}
				>
					Next
				</button>
			</div>
		</div>
	);
};
