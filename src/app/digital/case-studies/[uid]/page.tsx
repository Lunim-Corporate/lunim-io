// app/digital/case-studies/[uid]/page.tsx
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/prismicio";
import type { CaseStudySmDocumentWithLegacy } from "../types";
import { digitalCategoryToSlug } from "../utils";

type Params = { uid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;

  const client = createClient();
  const doc = await client
    .getByUID<CaseStudySmDocumentWithLegacy>("case_study_sm", uid)
    .catch(() => null);
  if (!doc) notFound();

  const categorySlug = digitalCategoryToSlug(doc.data.digital_category);
  if (!categorySlug) notFound();

  redirect(`/digital/${categorySlug}/case-studies/${uid}`);
}

// Static generation for known UIDs (optional)
export async function generateStaticParams() {
  const client = createClient();
  const docs = await client.getAllByType<CaseStudySmDocumentWithLegacy>("case_study_sm");
  return docs.map((d) => ({ uid: d.uid! }));
}
