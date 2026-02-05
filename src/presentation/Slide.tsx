import { clsx } from "clsx";

import { getComponent } from "./componentRegistry";

import type {
	CodeSlide,
	ComponentSlide,
	ContentSlide,
	ImageSlide,
	KantoColor,
	SectionsSlide,
	Slide as SlideType,
	TitleSlide,
} from "./types";

const ACCENT_COLOR_CLASSES: Record<KantoColor, string> = {
	pallet: "text-pallet",
	viridian: "text-viridian",
	pewter: "text-pewter",
	cerulean: "text-cerulean",
	vermillion: "text-vermillion",
	lavender: "text-lavender",
	celadon: "text-celadon",
	fuchsia: "text-fuchsia",
	saffron: "text-saffron",
	cinnabar: "text-cinnabar",
	indigo: "text-indigo",
	seafoam: "text-seafoam",
	prismatic: "prismatic-text",
};

const ACCENT_BORDER_CLASSES: Record<KantoColor, string> = {
	pallet: "border-pallet",
	viridian: "border-viridian",
	pewter: "border-pewter",
	cerulean: "border-cerulean",
	vermillion: "border-vermillion",
	lavender: "border-lavender",
	celadon: "border-celadon",
	fuchsia: "border-fuchsia",
	saffron: "border-saffron",
	cinnabar: "border-cinnabar",
	indigo: "border-indigo",
	seafoam: "border-seafoam",
	prismatic: "border-b-prismatic",
};

type SlideProps = {
	slide: SlideType;
};

const TitleSlideLayout = ({ slide }: { slide: TitleSlide }) => {
	const accentClass = slide.accentColor
		? ACCENT_COLOR_CLASSES[slide.accentColor]
		: "text-white";

	const hasImages = slide.images && slide.images.length > 0;

	return (
		<div className="flex flex-col items-center justify-center h-full text-center px-12">
			<h1
				className={clsx(
					"font-display leading-tight",
					hasImages ? "text-6xl mb-4" : "text-8xl mb-6",
					accentClass
				)}
			>
				{slide.title}
			</h1>
			{slide.subtitle && (
				<p className="text-4xl text-gray-400 mb-6">{slide.subtitle}</p>
			)}
			{hasImages && (
				<div className="flex flex-wrap items-center justify-center gap-6 mt-8">
					{slide.images!.map((image, index) => (
						<img
							key={index}
							src={image.src}
							alt={image.alt}
							className="max-h-160 max-w-full object-contain rounded-lg"
						/>
					))}
				</div>
			)}
		</div>
	);
};

const ContentSlideLayout = ({ slide }: { slide: ContentSlide }) => {
	const accentClass = slide.accentColor
		? ACCENT_COLOR_CLASSES[slide.accentColor]
		: "text-cerulean";

	const bulletAccent = slide.accentColor
		? ACCENT_COLOR_CLASSES[slide.accentColor]
		: "text-cerulean";

	return (
		<div className="flex flex-col justify-center h-full px-16 py-12">
			<h2 className={clsx("text-7xl font-display mb-4", accentClass)}>
				{slide.title}
			</h2>
			{slide.subtitle && (
				<p className="text-3xl text-gray-400 mb-10">{slide.subtitle}</p>
			)}
			<ul className={clsx("space-y-6", !slide.subtitle && "mt-8")}>
				{slide.bullets.map((bullet, index) => (
					<li key={index} className="flex items-start gap-4 text-2xl">
						<span className={clsx("font-bold", bulletAccent)}>&gt;</span>
						<span className="text-gray-200">{bullet}</span>
					</li>
				))}
			</ul>
		</div>
	);
};

const CodeSlideLayout = ({ slide }: { slide: CodeSlide }) => {
	const accentClass = slide.accentColor
		? ACCENT_COLOR_CLASSES[slide.accentColor]
		: "text-saffron";

	const borderClass = slide.accentColor
		? ACCENT_BORDER_CLASSES[slide.accentColor]
		: "border-saffron";

	return (
		<div className="flex flex-col justify-center h-full px-16 py-12">
			<h2 className={clsx("text-4xl font-display mb-8", accentClass)}>
				{slide.title}
			</h2>
			<div
				className={clsx(
					"bg-gray-900 border-2 rounded-lg p-6 overflow-auto",
					borderClass
				)}
			>
				<pre className="text-lg">
					<code className="font-mono text-gray-200 whitespace-pre">
						{slide.code.content}
					</code>
				</pre>
			</div>
			<p className="text-sm text-gray-500 mt-4 font-mono">
				{slide.code.language}
			</p>
		</div>
	);
};

const ImageSlideLayout = ({ slide }: { slide: ImageSlide }) => {
	const accentClass = slide.accentColor
		? ACCENT_COLOR_CLASSES[slide.accentColor]
		: "text-white";

	return (
		<div className="flex flex-col items-center justify-center h-full px-12 py-12">
			{slide.title && (
				<h2 className={clsx("text-4xl font-display mb-8", accentClass)}>
					{slide.title}
				</h2>
			)}
			<img
				src={slide.image.src}
				alt={slide.image.alt}
				className="max-h-[60vh] max-w-full object-contain rounded-lg"
			/>
		</div>
	);
};

const SectionsSlideLayout = ({ slide }: { slide: SectionsSlide }) => {
	const accentClass = slide.accentColor
		? ACCENT_COLOR_CLASSES[slide.accentColor]
		: "text-cerulean";

	const bulletAccent = slide.accentColor
		? ACCENT_COLOR_CLASSES[slide.accentColor]
		: "text-cerulean";

	return (
		<div className="flex flex-col justify-center h-full px-16 py-12 overflow-auto">
			<h2 className={clsx("text-5xl font-display mb-10", accentClass)}>
				{slide.title}
			</h2>
			<div className="grid grid-cols-2 gap-x-12 gap-y-8">
				{slide.sections.map((section, sectionIndex) => (
					<div key={sectionIndex}>
						<div className="flex items-center gap-3 mb-4">
							{section.icon && (
								<img
									src={section.icon}
									alt=""
									className="w-12 h-12 object-contain"
								/>
							)}
							<h3 className="text-4xl font-display text-gray-300">
								{section.heading}
							</h3>
						</div>
						<ul className="space-y-2">
							{section.bullets.map((bullet, bulletIndex) => (
								<li
									key={bulletIndex}
									className="flex items-start gap-3 text-2xl"
								>
									<span className={clsx("font-bold", bulletAccent)}>&gt;</span>
									<span className="text-gray-400">{bullet}</span>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
};

const ComponentSlideLayout = ({ slide }: { slide: ComponentSlide }) => {
	const accentClass = slide.accentColor
		? ACCENT_COLOR_CLASSES[slide.accentColor]
		: "text-cerulean";

	const Component = getComponent(slide.componentId);

	return (
		<div className="flex flex-col h-full px-12 py-12">
			{slide.title && (
				<h2 className={clsx("text-4xl font-display mb-8", accentClass)}>
					{slide.title}
				</h2>
			)}
			<div className="flex-1 overflow-auto">
				{Component ? (
					Component()
				) : (
					<div className="flex items-center justify-center h-full text-gray-500">
						Component &quot;{slide.componentId}&quot; not found in registry
					</div>
				)}
			</div>
		</div>
	);
};

export const Slide = ({ slide }: SlideProps) => {
	const renderSlideContent = () => {
		switch (slide.type) {
			case "title":
				return <TitleSlideLayout slide={slide} />;
			case "content":
				return <ContentSlideLayout slide={slide} />;
			case "code":
				return <CodeSlideLayout slide={slide} />;
			case "image":
				return <ImageSlideLayout slide={slide} />;
			case "sections":
				return <SectionsSlideLayout slide={slide} />;
			case "component":
				return <ComponentSlideLayout slide={slide} />;
		}
	};

	return (
		<div className="w-full h-full flex-shrink-0">{renderSlideContent()}</div>
	);
};
