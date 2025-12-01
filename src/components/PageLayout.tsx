import Footer from "~/components/Footer";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<main className="flex flex-col min-h-screen">
			{children}
			<Footer />
		</main>
	);
};

export default PageLayout;
