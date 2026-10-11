export type SeoInput = {
	title: string;
	description?: string;
	keywords?: string;
	image?: string;
	imageAlt?: string;
	url?: string;
	siteName?: string;
	author?: string;
};

const IMAGE_WIDTH = "1200";
const IMAGE_HEIGHT = "630";

export const seo = ({
	title,
	description,
	keywords,
	image,
	imageAlt,
	url,
	siteName,
	author,
}: SeoInput) => {
	const tags = [
		{ title },
		{ name: "description", content: description },
		{ name: "keywords", content: keywords },
		{ name: "author", content: author },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ property: "og:type", content: "website" },
		{ property: "og:site_name", content: siteName },
		{ property: "og:url", content: url },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		...(image
			? [
					{ name: "twitter:image", content: image },
					{ name: "twitter:image:alt", content: imageAlt },
					{ name: "twitter:card", content: "summary_large_image" },
					{ property: "og:image", content: image },
					{ property: "og:image:width", content: IMAGE_WIDTH },
					{ property: "og:image:height", content: IMAGE_HEIGHT },
					{ property: "og:image:alt", content: imageAlt },
				]
			: [{ name: "twitter:card", content: "summary" }]),
	];

	return tags;
};
