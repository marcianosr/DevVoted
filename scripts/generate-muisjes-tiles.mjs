import { writeFileSync } from "node:fs";

const TILE = 180;
const COUNT = 260;
const GROUND = "#221a14";

// Deterministic PRNG so regenerating the tiles yields the same scatter.
const rng = (seed) => () => {
	seed = (seed * 1664525 + 1013904223) % 4294967296;
	return seed / 4294967296;
};

const PALETTES = {
	muisjes: ["#4f3236", "#5b3d40", "#333841", "#3e454e", "#564b40", "#473d34"],
	"muisjes-pink": ["#4f3236", "#5b3d40", "#563239", "#613e45", "#564b40", "#473d34"],
	"muisjes-blue": ["#333841", "#3e454e", "#36404b", "#434f5c", "#564b40", "#473d34"],
};

const tile = (name, colors) => {
	const random = rng(1305); // 13 May, for luck
	const shapes = [];
	for (let i = 0; i < COUNT; i++) {
		const rx = 3.2 + random() * 3.4;
		const ry = rx * (0.62 + random() * 0.24);
		const cx = random() * TILE;
		const cy = random() * TILE;
		const angle = Math.round(random() * 180);
		const fill = colors[Math.floor(random() * colors.length)];
		// Wrap shapes that cross an edge so the tile repeats seamlessly.
		const xs = [cx, cx < rx ? cx + TILE : null, cx > TILE - rx ? cx - TILE : null];
		const ys = [cy, cy < rx ? cy + TILE : null, cy > TILE - rx ? cy - TILE : null];
		for (const x of xs.filter((v) => v !== null)) {
			for (const y of ys.filter((v) => v !== null)) {
				const r = (v) => Math.round(v * 10) / 10;
				shapes.push(
					`<ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(rx)}" ry="${r(ry)}" fill="${fill}" transform="rotate(${angle} ${r(x)} ${r(y)})"/>`
				);
			}
		}
	}
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}"><rect width="${TILE}" height="${TILE}" fill="${GROUND}"/>${shapes.join("")}</svg>\n`;
	writeFileSync(`public/skins/${name}.svg`, svg);
	console.log(name, shapes.length, "shapes", svg.length, "bytes");
};

for (const [name, colors] of Object.entries(PALETTES)) tile(name, colors);
