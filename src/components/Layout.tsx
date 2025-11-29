import Footer from "./Footer";

type LayoutProps = {
	poll: {
		categoryCode: string;
	};
	children: React.ReactNode;
};

const Layout = ({ poll, children }: LayoutProps) => {
	return (
		<section data-category-theme={poll.categoryCode}>
			{children}
			<Footer />
		</section>
	);
};

export default Layout;
