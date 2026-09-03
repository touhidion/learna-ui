import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";

/**
 * Public shell: navbar, content, footer.
 *
 * These routes render on the server for SEO (features UP2, UP3), so nothing
 * here may depend on the session. The navbar is a client component and adapts
 * on its own once hydrated.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
