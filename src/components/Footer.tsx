const Footer = () => (
	<footer className="p-4 mt-8 bg-zinc-900 text-center text-white">
		<p>
			A crazy roguelike obsession build with craftsmanship, passion, ❤️ &
			Tanstack Start by Marciano Schildmeijer | EST may 2022
		</p>
		<p className="mt-2 text-sm text-zinc-400">
			Found a bug?{" "}
			<a
				href="https://github.com/marcianosr/DevVoted/issues"
				target="_blank"
				rel="noopener noreferrer"
				className="text-blue-400 hover:text-blue-300 underline"
			>
				Report it on GitHub
			</a>
		</p>
	</footer>
);
export default Footer;
