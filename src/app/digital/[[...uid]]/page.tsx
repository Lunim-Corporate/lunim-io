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
import CaseStudies from "@/components/CaseStudies";
import { CaseStudySmDocumentWithLegacy } from "../case-studies/types";
// Next
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";

type Params = { uid: string[] };
// export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<Params> }) {
    const { uid } = await params;
    
    const client = createClient();
    
    // /digital
    if (!uid) {
        // console.log("Root");
        const doc = await (client as any)
            .getSingle("tech")
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
        const doc = (await (client as any).getByUID("digital_page", uid[0]).catch(() => null)) as DigitalPageDocument | null;
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
        const allCaseStudies = (await (client as any).getAllByType("case_study_sm")) as CaseStudySmDocumentWithLegacy[];
        const filteredCaseStudies = allCaseStudies.filter((cs: any) => cs.data.digital_category === uid[0]);
        const caseStudyPage = await (client as any).getSingle("case_studies").catch(() => null);
        return <CaseStudies filteredCaseStudies={filteredCaseStudies} caseStudyPage={caseStudyPage} />;
    }
    
    // /digital/[uid]/case-studies/[uid]
    // E.g., ["ai", "case-studies", "pizza-hut-checkout"]
    else if (uid.length === 3) {
        // console.log("3", uid);
        const doc = await client.getByUID("case_study_sm", uid[2]).catch(() => null);
        if (!doc) notFound();

        // Ensure the fetched case study actually belongs to the requested category.
        // Without this check a case study with UID `pizza-hut-checkout` in category
        // `ux` would still render at `/digital/web3/case-studies/pizza-hut-checkout`.
        const caseStudyCategory = doc.data?.digital_category;
        if (caseStudyCategory !== uid[0]) {
            notFound();
        }
        const slices = doc.data.slices;
        return (
            <main className="bg-black text-white min-h-screen">
                <SliceZone slices={slices} components={components} />
            </main>
        );
    }
}

export async function generateMetadata(
    { params }: { params: Promise<Params> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { uid } = await params;
    const client = createClient();
    const parentMetaData = await pickBaseMetadata(parent);
    let doc;

    if (!uid) {
        doc = await client.getSingle("tech").catch(() => null);
    }
    else if (uid.length === 1) {
        doc = await client.getByUID("digital_page", uid[0]).catch(() => null);
    } else if (uid.length === 2 && uid[1] === "case-studies") {
        doc = await client.getSingle("case_studies").catch(() => null);
    } else if (uid.length === 3) {
        doc = await client.getByUID("case_study_sm", uid[2]).catch(() => null);
        // Ensure metadata generation respects the requested category.
        // If the fetched case study's category doesn't match the route's category,
        // treat it as not found to keep behavior consistent with the page renderer.
        if (doc) {
            const caseStudyCategory = String(doc.data?.digital_category || "").trim().toLowerCase();
            const requestedCategory = String(uid[0] || "").trim().toLowerCase();
            if (caseStudyCategory !== requestedCategory) notFound();
        }
    }

    if (!doc) {
        return {
            title: "Lunim",
            description: "Welcome to Lunim's official homepage."
        };
    }

    return generateMetaDataInfo(doc.data, parentMetaData, false, true, uid);
}

export async function generateStaticParams(): Promise<Array<{ uid: string[] }>> {
  const client = createClient();

  // Always include the root /digital
  const params: Array<{ uid: string[] }> = [{ uid: [] }];

  // 1) /digital/{category}  (digital_page)
  const digitalPages = await (client as any).getAllByType("digital_page").catch(() => []);
  for (const p of digitalPages) {
    if (p?.uid) params.push({ uid: [String(p.uid)] });
  }

  // 2) /digital/{category}/case-studies  (list page for each category)
  //    create one per category we found above
  for (const p of digitalPages) {
    if (p?.uid) params.push({ uid: [String(p.uid), "case-studies"] });
  }

  // 3) /digital/{category}/case-studies/{caseUid}  (individual case studies)
  const caseStudies = await (client as any).getAllByType("case_study_sm").catch(() => []);
  for (const cs of caseStudies) {
    // Preferred: if your doc includes a category field
    const category = (cs?.data?.digital_category || "").toString().trim();
    if (category) {
      if (cs?.uid) params.push({ uid: [category, "case-studies", String(cs.uid)] });
      continue;
    }
  }

  // Deduplicate entries (simple JSON key)
  const seen = new Set<string>();
  const deduped = params.filter((p) => {
    const key = JSON.stringify(p.uid);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped;
}


/* Notes
Why you cannot do `digital/[[...uid]]/opengraph-image.tsx` for OG images:
    Next.js can’t statically predict all possible paths (/, /docs/getting-started, /blog/hello-world, etc.).
    Because of that, it does not automatically inject OG meta tags for catch-all or optional catch-all routes.

    Instead, it assumes you might want to decide dynamically — so the automatic discovery is skipped.
*/