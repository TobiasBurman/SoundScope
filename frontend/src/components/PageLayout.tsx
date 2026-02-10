import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

const PageLayout = ({ children, sidebar }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#182736] via-[#162433] to-[#141f2b] flex flex-col">
      <Header />

      <div className="flex-1 w-full px-8 py-12">
        <div className="relative max-w-7xl mx-auto">
          {children}

          {sidebar && (
            <aside className="mt-8 lg:mt-0 lg:absolute lg:top-0 lg:-right-80 lg:w-72">
              <div className="lg:sticky lg:top-8">{sidebar}</div>
            </aside>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PageLayout;
