import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#182736] via-[#162433] to-[#141f2b] flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto px-8 py-12 w-full">
        {children}
      </div>

      <Footer />
    </div>
  );
};

export default PageLayout;
