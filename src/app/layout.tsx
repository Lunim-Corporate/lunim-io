import { Suspense } from "react";
import { createClient, repositoryName } from "@/prismicio";
import { PrismicPreview } from "@prismicio/next";
import "./globals.css";
import NavigationMenu from "@/slices/NavigationMenu";
import Footer from "@/slices/Footer";
import { Content } from "@prismicio/client";
import SmoothScroll from "@/components/SmoothScroll";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = createClient();
  const primaryNav = await client.getSingle<Content.PrimaryNavigationDocument>("primary_navigation").catch(() => null);
  // Extract the navigation_menu slice from the slices array
  const navigationMenu = primaryNav?.data?.slices.find(
    (slice) => slice.slice_type === "navigation_menu"
  );
  // Fetch the footer slice
  const footer = await client.getSingle<Content.FooterDocument>("footer").catch(() => null);
  const footerSlice = footer?.data?.slices.find(
    (slice) => slice.slice_type === "footer"
  );

  return (
    <html lang="en">
      <head>
        <script
          async
          defer
          src="https://static.cdn.prismic.io/prismic.js?new=true&repo=lunim-v3"
        ></script>
      </head>
      <body className="bg-black">
        <Suspense fallback={null}>
          <SmoothScroll />
        </Suspense>
        <PrismicPreview repositoryName={repositoryName}>
          {navigationMenu && (
            <NavigationMenu
              slice={navigationMenu}
              index={0} // Default index
              slices={primaryNav?.data?.slices || []} // Pass the full slices array
              context={{}} // Provide an empty context object
            />
          )}
          {children}
          {footerSlice && (
            <Footer
              slice={footerSlice}
              index={0}
              slices={footer?.data?.slices || []}
              context={{}}
            />
          )}
        </PrismicPreview>
      </body>
    </html>
  );
}
