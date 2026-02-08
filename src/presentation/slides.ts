import type { Slide } from "./types";

export const slides: Slide[] = [
	{
		id: "01-welcome",
		type: "title",
		title: "DevVoted: Van Slack Poll naar Roguelite",
		subtitle: "Learning is done best through play",
		accentColor: "prismatic",
	},
	{
		id: "02-intro-title",
		type: "title",
		title: "1. Intro",
		accentColor: "cerulean",
	},
	{
		id: "03-intro",
		type: "content",
		title: "Dit is DevVoted",
		subtitle:
			"DevVoted is een roguelite game waarin spelers deelnemen aan dagelijkse polls over development topics, met als doel hun kennis te vergroten en te concurreren tegen anderen.",
		bullets: [
			"Dev = Developer",
			"Voted = Gestemd",
			"Devotion = Toewijding",
			"Dev + Voted + Devotion = DevVoted",
		],
		accentColor: "cerulean",
	},
	{
		id: "04-roguelite",
		type: "content",
		title: "Roguelite in het kort",
		bullets: [
			"Runs = Relatief korte speelsessies met een duidelijk doel",
			"Procedurally generated content - elke run is anders",
			"Permadeath = Bij falen begin je opnieuw, maar met behoud van bepaalde upgrades",
		],
		accentColor: "cerulean",
	},
	{
		id: "05-transition",
		type: "title",
		title: "En dat lijkt verdacht veel op...",
		accentColor: "lavender",
	},
	{
		id: "06-software-dev",
		type: "content",
		title: "Software development",
		bullets: [
			"Iteratief proces",
			"Leren door doen",
			"Bijsturen op basis van feedback",
			"We beginnnen weer opnieuw, maar nemen onze kennis mee",
			"Continue verbetering",
		],
		accentColor: "lavender",
	},
	{
		id: "07-origin-title",
		type: "title",
		title: "2. Hoe is dit ontstaan?",
		accentColor: "seafoam",
	},
	{
		id: "08-origin-timeline",
		type: "content",
		title: "Van idee naar DevVoted",
		bullets: [
			"2004 - Nieuwsgierigheid in games en community building",
			"2021 – Slack polls (handmatig)",
			"2022 – polls + gamification (te vlak)",
			"2023 – redesign poging (geen richting)",
			"2024 – ontdekking roguelite",
			"2025 – bouwen + beta",
			"2026 – Kabisa + iteratie",
		],
		accentColor: "seafoam",
	},
	{
		id: "09-design-title",
		type: "title",
		title: "3. Het ontwerpen",
		accentColor: "cinnabar",
	},
	{
		id: "10-design-iterations",
		type: "content",
		title: "Itereren (runs)",
		bullets: [
			"Brainstorm → nah",
			"Brainstorm → gamen",
			"Brainstorm → schets → nah → twijfel-twijfel",
			"Schets → nadenken → schrappen",
			"?????????????????",
			"Brainstorm → wireframe → feel → nah",
			"Alleen nadenken → niks bouwen",
			"Brainstorm → build → vastlopen",
			"Wireframe → build → twijfel-twijfel-twijfel",
		],
		accentColor: "cinnabar",
	},
	{
		id: "10b-design-iterations",
		type: "title",
		title: "Brainstorm → wireframe → feel → build → test → repeat ✅",
		accentColor: "prismatic",
	},
	{
		id: "11-design-example",
		type: "sections",
		title: "Voorbeeld: Progressie systeem",
		sections: [
			{
				heading: "Startidee",
				bullets: ["Klassiek XP systeem (levels + levens)"],
			},
			{
				heading: "Mijn gevoel",
				bullets: [
					"Leuk om punten te krijgen…",
					"maar ik had geen idee wat mijn XP eigenlijk zei over mijn kennis",
				],
			},
			{
				heading: "Analyse",
				bullets: ["XP gaf voortgang, maar betekende niks"],
			},
			{
				heading: "Pivot",
				bullets: [
					'XP vervangen door iets wat dichterbij developers leeft: "coverage" per categorie',
					"Mastery zichtbaar maken",
				],
			},
			{
				heading: "Proces",
				bullets: [
					"Ideeën ontstaan in rustige momenten, games of met AI",
					"Wireframes om gevoel te testen",
					"Bouwen -> tastbaar maken",
					"Testers bevestigen of iets werkt",
				],
			},
		],
		accentColor: "cinnabar",
	},
	{
		id: "12-design-reflection",
		type: "title",
		title: "Goed, dit was één voorbeeld van ontwerpen door itereren",
		accentColor: "saffron",
	},
	{
		id: "13-design-transition",
		type: "title",
		title: "En na al die iteraties...",
		accentColor: "saffron",
		images: [
			{ src: "/presentation/docs-notion.png", alt: "Notion documentatie" },
			{ src: "/presentation/ai-chat.png", alt: "AI chat screenshot" },
		],
	},
	{
		id: "14-result-title",
		type: "title",
		title: "4. Wat is het dan geworden?",
		accentColor: "fuchsia",
	},
	{
		id: "15-result-description",
		type: "title",
		title: 'Een "Dev-themed Roguelite game"',
		accentColor: "prismatic",
	},

	// 'Spelers kunnen "coverage" scoren door vragen correct te beantwoorden in dagelijkse polls',
	// 		'Spelers "strijden" door dagelijkse polls tegen een CI coverage gate, met zichzelf maar ook tegen elkaar',
	// 		"Spelers kunnen powerups gebruiken om hun kansen/strategie in de run te verbeteren (installable configs), of die van anderen te dwarsbomen",
	// 		"Spelen is leren: door deel te nemen aan de polls, leren spelers over verschillende development topics",
	{
		id: "16-demo-poll",
		type: "component",
		title: "Daily Poll",
		// subtitle: "Kennis opbouwen door dagelijks korte quizzes",
		componentId: "daily-poll",
		accentColor: "indigo",
	},
	{
		id: "17-demo-coverage",
		type: "component",
		title: "Coverage % per categorie",
		componentId: "coverage",
		accentColor: "celadon",
	},
	{
		id: "18-demo-leaderboard",
		type: "component",
		title: "Spelers kunnen tegen elkaar strijden",
		componentId: "leaderboard",
		accentColor: "vermillion",
	},
	{
		id: "19-demo-CI-gates",
		type: "component",
		title: "Maar strijden ook tegen de CI gate",
		componentId: "ci-gates",
		accentColor: "fuchsia",
	},
	{
		id: "20-demo-configs",
		type: "component",
		title: "Power-ups: Configs",
		componentId: "config-cards",
		accentColor: "lavender",
	},
	{
		id: "21-personal-title",
		type: "title",
		title: "5. Wat zegt dit over mij?",
		accentColor: "viridian",
	},
	{
		id: "23-personal-breakdown",
		type: "sections",
		title: "DevVoted === ik",
		sections: [
			{
				heading: "Een game",
				bullets: ["Creativiteit + emotie"],
			},
			{
				heading: "Runs",
				bullets: ["Consistent bouwen + leren, iteratief proces"],
			},
			{
				heading: "Gates",
				bullets: ["Kwaliteitsdrempels"],
			},
			{
				heading: "Configs",
				bullets: ["Tinkering, strategie en experimenteren"],
			},
			{
				heading: "Polls + Community",
				bullets: ["Verbinding en kennis delen"],
			},
		],
		accentColor: "viridian",
	},
	{
		id: "24-tech-title",
		type: "title",
		title: "6. Tech stack en architectuur",
		accentColor: "vermillion",
	},
	{
		id: "25a-tech-stack",
		type: "content",
		title: "Passende tech stack",
		bullets: [],
		accentColor: "vermillion",
	},
	{
		id: "25b-tech-stack",
		type: "sections",
		title: "Tech stack",
		sections: [
			{
				heading: "Supabase (BaaS)",
				icon: "/presentation/supabase.png",
				bullets: ["Auth", "Postgres DB", "Realtime functies"],
			},
			{
				heading: "TanStack Start Framework",
				icon: "/presentation/tanstack.png",
				bullets: ["SSR approach", "Server functions", "Type safe Router"],
			},
			{
				heading: "Drizzle ORM",
				icon: "/presentation/drizzle.png",
				bullets: ["Type safe ORM", "SQL migrations"],
			},
			{
				heading: "AI",
				icon: "/presentation/ai.png",
				bullets: ["Voor (technische) brainstorming/sparrings partner"],
			},
			{
				heading: "En andere tools",
				bullets: [
					"Tailwind CSS, Vitest, Vercel, Notion, Figma, GitHub Copilot, Tekenblok etc.",
				],
			},
		],
		accentColor: "vermillion",
	},
	{
		id: "26-architecture-code",
		type: "code",
		title: "Structuur: Domain Driven Design + Screaming Architecture",
		code: {
			language:
				"Screaming Architecture - duidelijke scheiding tussen UI, domain logic en data laag",
			content: `src/domains/
					├── polls/      # Core quiz vragen
					├── runs/       # Game sessies
					├── configs/    # Power-up systeem
					├── score/      # Scoring berekeningen
					└── economy/    # Shop & storage`,
		},
		accentColor: "vermillion",
	},
	{
		id: "27-lessons",
		type: "title",
		title: "7. Lessons (re)learned",
		accentColor: "cinnabar",
	},
	{
		id: "27b-lessons",
		type: "content",
		title: "Zou ik het anders doen?",
		subtitle: "Takeaways",
		bullets: [
			"Ontwikkel een gevoel voor wat je leuk vindt",
			"Gevoel is een valide ontwerpsignaal",
			"Documenteer je ideeën en beslissingen",
			"Snelle iteratie is key - zowel in development als in game design",
			"'Perfecte' code schrijven - ook beschouwen als iteratief proces",
			"Beta testers zijn goud waard: Feedback!",
			"Een spel maken is echt moeilijk",
			"Een spel maken is echt leuk",
		],
		accentColor: "cinnabar",
	},
	{
		id: "28-end",
		type: "title",
		title: "Dankje voor het luisteren!",
		subtitle: "En als je nieuwsgierig bent: doe gezellig mee!",
		accentColor: "prismatic",
	},
];
