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

type Params = { uid: string[] };

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
        const filteredCaseStudies = allCaseStudies.filter((cs: CaseStudySmDocumentWithLegacy) => cs.data.digital_category === uid[0]);
        const caseStudyPage = await (client as any).getSingle("case_studies").catch(() => null);
        return <CaseStudies filteredCaseStudies={filteredCaseStudies} caseStudyPage={caseStudyPage} />;
    }
    
    // /digital/[uid]/case-studies/[uid]
    // E.g., ["ai", "case-studies", "pizza-hut-checkout"]
    else if (uid.length === 3) {
        // console.log("3", uid);
        const doc = await (client as any).getByUID("case_study_sm", uid[2]).catch(() => null);
        if (!doc) notFound();
        const slices = doc.data.slices;
        return (
            <main className="bg-black text-white min-h-screen">
                <SliceZone slices={slices} components={components} />
            </main>
        );
    }
}