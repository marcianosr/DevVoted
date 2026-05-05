import Footer from "~/components/Footer.component";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<main className="flex flex-col min-h-screen pb-24">
			{children}
			<Footer />
		</main>
	);
};

export default PageLayout;
