// Prismic
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
// Next
import type { Metadata, ResolvingMetadata } from "next";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { notFound } from "next/navigation";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";
import type { Organization, WebSite } from "schema-dts";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 60;

export default async function Page() {
  const client = createClient();
  const doc = (await (client as any)
    .getSingle("homepage")
    .catch(() => null)) as Content.HomepageDocument | null;
  if (!doc) notFound();

  // console.log("✅ Slices:", doc.data.slices.map((slice) => slice.slice_type)// );
  const jsonLd: {
    "@context": "https://schema.org";
    "@graph": [Organization, WebSite];
  } = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Lunim",
        url: "https://lunim.io",
        logo: "https://lunim.io/logo.png",
      },
      {
        "@type": "WebSite",
        name: "Lunim",
        url: "https://lunim.io",
      },
    ],
  };
  return (
    <>
      <JsonLd data={jsonLd} />
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
