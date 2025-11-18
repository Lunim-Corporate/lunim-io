// Prismic
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
// Next
import type { Metadata, ResolvingMetadata } from "next";
import { JsonLdServer } from "@/components/JsonLdServer";
import type { WithContext, Organization, WebSite } from "schema-dts";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { notFound } from "next/navigation";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";

export const revalidate = 60;

export default async function Page() {
  const client = createClient();
  const doc = (await (client as any)
    .getSingle("homepage")
    .catch(() => null)) as Content.HomepageDocument | null;
  if (!doc) notFound();

  const orgJsonLd: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lunim",
    url: "https://lunim.io",
    logo: "https://lunim.io/logo.png",
  };

  const siteJsonLd: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lunim",
    url: "https://lunim.io",
  };

  // console.log("✅ Slices:", doc.data.slices.map((slice) => slice.slice_type)// );
  return (
    <>
      <JsonLdServer data={orgJsonLd} />
      <JsonLdServer data={siteJsonLd} />
      <main className="bg-black">
        <SliceZone slices={doc.data.slices} components={components} />
      </main>
    </>
  );
}

export async function generateMetadata(
  _context: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = (await (client as any)
    .getSingle("homepage")
    .catch(() => null)) as any;
  if (!doc) {
    return {
      title: "Lunim Home Page",
      description: "Welcome to Lunim's official homepage.",
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, true);
}

// export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
//   const pathname = "/";

//   return getMetaDataInfo(pathname, parent);
//   }
