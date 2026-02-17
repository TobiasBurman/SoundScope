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
        <div className="relative max-w-6xl mx-auto">
          {children}

          {/* Sidebar — anchored to the right of the centered container */}
          {sidebar && (
            <aside
              className="hidden xl:block absolute top-0 w-64"
              style={{ left: "calc(100% + 2rem)" }}
            >
              <div className="sticky top-8">{sidebar}</div>
            </aside>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PageLayout;
