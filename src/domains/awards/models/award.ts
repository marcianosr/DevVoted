import { CATEGORY_METADATA } from "~/domains/shared/categories";
import type { CategoryCode } from "~/domains/shared/categories";

export type AwardMetric = "coverage" | "streak" | "polls_answered";

export type CategoryAward = {
	name: string;
	description: string;
	categoryCode: CategoryCode;
	metric: AwardMetric;
};

export type AwardHolder = {
	userId: string;
	displayName: string;
	photoUrl?: string | null;
	value: number;
};

export type CategoryAwardWithHolder = {
	award: CategoryAward;
	holder: AwardHolder;
	runnerUp: AwardHolder | null;
	isNewlyUnlocked: boolean;
};

const CATEGORY_AWARDS: Record<CategoryCode, Record<AwardMetric, string>> = {
	css: {
		coverage: "CSS Connoisseur",
		streak: "Selector Sorcerer",
		polls_answered: "CSS Carrier",
	},
	js: {
		coverage: "every()thing Correct",
		streak: "Prototype Pioneer",
		polls_answered: "Const(ant) Voter",
	},
	react: {
		coverage: "React Rocket",
		streak: "Hook Handler",
		polls_answered: "React 4 U",
	},
	ts: {
		coverage: "Type Architect",
		streak: "Generic Wizard",
		polls_answered: "TypeScript Tinkerer",
	},
	html: {
		coverage: "Markup Master",
		streak: "Semantic Scholar",
		polls_answered: "HTML Hobbyist",
	},
	git: {
		coverage: "Git GOAT",
		streak: "Branch Manager",
		polls_answered: "Git Contributor",
	},
	"general-frontend": {
		coverage: "Forza Frontend",
		streak: "Browser Whisperer",
		polls_answered: "Frontend Fury",
	},
	java: {
		coverage: "Cold Starter",
		streak: "Verbose Virtuoso",
		polls_answered: "Java Jockey",
	},
	python: {
		coverage: "Oracle of Seasons",
		streak: "Snake Charmer",
		polls_answered: "Pythonista",
	},
	ruby: {
		coverage: "Ruby Royale",
		streak: "Gem Collector",
		polls_answered: "Ruby Rookie",
	},
	"general-backend": {
		coverage: "Pipeline Veteran",
		streak: "Endpoint Engineer",
		polls_answered: "Server Scout",
	},
};

const buildDescription = (
	metric: AwardMetric,
	categoryName: string
): string => {
	const descriptions: Record<AwardMetric, string> = {
		coverage: `Highest ${categoryName} coverage in any active run`,
		streak: `Longest active ${categoryName} correct-answer streak`,
		polls_answered: `Most ${categoryName} polls answered in active runs`,
	};
	return descriptions[metric];
};

export const getCategoryAwardDefinition = (
	categoryCode: CategoryCode,
	metric: AwardMetric
): CategoryAward => ({
	name: CATEGORY_AWARDS[categoryCode][metric],
	description: buildDescription(metric, CATEGORY_METADATA[categoryCode].name),
	categoryCode,
	metric,
});
