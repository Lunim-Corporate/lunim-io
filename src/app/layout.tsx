import { Suspense } from "react";
import { createClient, repositoryName } from "@/prismicio";
import { PrismicPreview } from "@prismicio/next";
import { LayoutProvider } from "@/contexts/LayoutContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

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
        <Suspense fallback={null}>
          <SmoothScroll />
        </Suspense>
        <PrismicPreview repositoryName={repositoryName}>
          <LayoutProvider initialData={layout}>
            <Header />
            {children}
            <Footer />
          </LayoutProvider>
        </PrismicPreview>
      </body>
    </html>
  );
}
