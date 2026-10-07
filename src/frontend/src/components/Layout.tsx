import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Outlet } from "@tanstack/react-router";

/**
 * Shared application shell: forest-green header, parchment content area, and
 * sand footer. Page routes render into the `Outlet`.
 */
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-gradient-subtle">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
