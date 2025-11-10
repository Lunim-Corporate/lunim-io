// digital/[[...uid]]/page.tsx
/* digital/[uid]
    Discovery - digital/discovery
    User Experience - digital/ux
    AI Workflows - digital/ai
    Web3 & Decentralisation - digital/web3
*/
/* digital/[uid]/case-studies
    e.g., digital/ai/case-studies
    Fetch all 'case_study_sm' documents and filter by `digital_category` based on parent route (e.g., discovery, ux, ai, web3)
*/
/* digital/[uid]/case-studies/[uid]
    e.g., digital/ai/case-studies/pizza-hut-checkout
 */
// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { DigitalPageDocument } from "../../../../prismicio-types";
import { Content } from "@prismicio/client";
import CaseStudies from "@/components/CaseStudies";
import { CaseStudySmDocumentWithLegacy } from "../case-studies/types";
// Next
import { notFound } from "next/navigation";
// import { Metadata, ResolvingMetadata } from "next";
// import { pickBaseMetadata } from "@/utils/metadata";

type Params = { uid: string[] };

export default async function Page({ params }: { params: Promise<Params> }) {
    const { uid } = await params;
    
    const client = createClient();
    
    // /digital
    if (!uid) {
        // console.log("Root");
        const doc = await client
            .getSingle<Content.TechDocument>("tech")
            .catch(() => null);
        if (!doc) notFound()
        return (
            <main className="bg-black">
                <SliceZone slices={doc.data.slices} components={components} />
            </main>
        );
    }
    
    // /digital/[uid]
    else if (uid.length === 1) {
        // console.log("1", uid);
        const doc = await client.getByUID<DigitalPageDocument>("digital_page", uid[0]).catch(() => null);
        if (!doc) notFound();
        const slices = doc.data?.slices;
        return (
            <main className="bg-black text-white min-h-screen">
                <SliceZone slices={slices} components={components} />
            </main>
        );
    }
    
    // /digital/[uid]/case-studies
    // E.g., ["ai", "case-studies"], ["web3", "case-studies"]
    else if (uid.length === 2) {
        // console.log("2", uid);
        if (uid[1] !== "case-studies") notFound();
        const allCaseStudies = await client.getAllByType<CaseStudySmDocumentWithLegacy>("case_study_sm");
        const filteredCaseStudies = allCaseStudies.filter((cs) => cs.data.digital_category === uid[0]);
        const caseStudyPage = await client.getSingle("case_studies").catch(() => null);
        return <CaseStudies filteredCaseStudies={filteredCaseStudies} caseStudyPage={caseStudyPage} />;
    }
    
    // /digital/[uid]/case-studies/[uid]
    // E.g., ["ai", "case-studies", "pizza-hut-checkout"]
    else if (uid.length === 3) {
        // console.log("3", uid);
        const doc = await client.getByUID("case_study_sm", uid[2]).catch(() => null);
        if (!doc) notFound();
        const slices = doc.data.slices;
        return (
            <main className="bg-black text-white min-h-screen">
                <SliceZone slices={slices} components={components} />
            </main>
        );
    }
}

// export async function generateMetadata(
//   _context: unknown,
//   parent: ResolvingMetadata
// ): Promise<Metadata> {
//   // fetch data
//   const client = createClient();
//   const parentMetaData = await pickBaseMetadata(parent);
//   const doc = await client
//   .getSingle<Content.HomepageDocument>("homepage")
//   .catch(() => null);
//   if (!doc) {
//     return {
//       title: "Lunim Home Page",
//       description: "Welcome to Lunim's official homepage."
//     };
//   }


//   // const parentUrl = (await parent).openGraph?.images?.[0]?.url || "";
//   // const parentAlt = (await parent).openGraph?.images?.[0]?.alt || "";
//   const parentKeywords = parentMetaData.keywords || "";
//   // Filter out empty keyword fields
//   // Ensure each keyword is separated by a comma and space
//   // Join keywords from current page (if any) to parent keywords
//   const keywords = doc.data?.meta_keywords.filter((val) => Boolean(val.meta_keywords_text)).length >= 1 ? `${parentKeywords}, ${doc.data.meta_keywords.map((k) => k.meta_keywords_text?.toLowerCase()).join(", ")}` : parentKeywords;
//   const title = doc.data?.meta_title || parentMetaData.title;
//   const description = doc.data?.meta_description || parentMetaData.description;
//   const canonicalUrl = doc.data?.meta_url || "";

//   return {
//     ...parentMetaData,
//     title: title,
//     description: description,
//     keywords: keywords,
//     openGraph: {
//       ...parentMetaData.openGraph,
//       title: `${title}`,
//       description: `${description}`,
//       url: canonicalUrl,
//       // images: [
//       //   {
//       //     url: `${doc.data?.meta_image}` || `${parentUrl}`,
//       //     alt: `${doc.data?.meta_image_alt_text}` || `${parentAlt}`,
//       //   }
//       // ]
//     },
//   }
// }