import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  leftSidebar?: React.ReactNode;
}

const PageLayout = ({ children, sidebar, leftSidebar }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-surface-0 flex flex-col relative overflow-hidden">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-accent-400/10 dark:bg-accent-500/5 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-accent-400/10 dark:bg-accent-500/5 blur-[150px]" />

      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        <div className="flex-1 w-full px-8 py-12">
          <div className="relative max-w-6xl mx-auto">
            {/* Left sidebar — anchored to the left of the centered container */}
            {leftSidebar && (
              <aside
                className="hidden xl:block absolute top-0 w-64"
                style={{ right: "calc(100% + 2rem)" }}
              >
                <div className="sticky top-8">{leftSidebar}</div>
              </aside>
            )}

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
    </div>
  );
};

export default PageLayout;
