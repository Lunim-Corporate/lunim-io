// Prismic
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
// Next
import type { Metadata, ResolvingMetadata } from "next";
import Script from "next/script";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { notFound } from "next/navigation";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";
// Schema
import type { WithContext, Organization } from "schema-dts";

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
    alternateName: "Lunim.io",
    url: "https://lunim.io/",
    logo: "https://images.prismic.io/lunim-v3/aO4uRJ5xUNkB17lv_lunim-logo.png",
    description: "Lunim - Technology and innovation solutions",
    sameAs: [
      // Add your social media profile URLs here when available
      // "https://twitter.com/lunim",
      // "https://linkedin.com/company/lunim",
      // "https://facebook.com/lunim"
    ],
  };

  // console.log("✅ Slices:", doc.data.slices.map((slice) => slice.slice_type)// );
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
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
