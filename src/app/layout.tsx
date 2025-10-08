import { createClient } from "@/prismicio";
import { LayoutProvider } from "@/contexts/LayoutContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = createClient();
  const layout = await client.getSingle("layout").catch(() => null);

  return (
    <html lang="en">
      <body className="bg-black">
        <LayoutProvider initialData={layout}>
          <Header />
          {children}
          <Footer />
        </LayoutProvider>
      </body>
    </html>
  );
}
