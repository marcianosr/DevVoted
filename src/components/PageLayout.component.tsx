import Footer from "~/components/Footer.component";
import { PageLayoutUI } from "~/ui/PageLayoutUI.component";

const PageLayout = ({ children }: { children: React.ReactNode }) => (
	<PageLayoutUI footer={<Footer />}>{children}</PageLayoutUI>
);

export default PageLayout;
