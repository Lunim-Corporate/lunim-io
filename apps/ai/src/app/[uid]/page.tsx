// Next
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "../../prismicio";
import { components } from "@lunim/ui/slices";
import type { AiAutomationDocument } from "../../../../../prismicio-types";
// Utils
import { pickBaseMetadata } from "@lunim/utils";
import { generateMetaDataInfo } from "@lunim/utils";

export const revalidate = false;

type Params = { uid: string };

export default async function AiAutomationDynamicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uid } = await params;

  const client = createClient();
  const doc = (await (client as any)
    .getByUID("ai_automation", uid)
    .catch(() => null)) as AiAutomationDocument | null;

  if (!doc) notFound();

  const slices = doc.data?.slices;

  return (
    <main className="bg-black text-white min-h-screen">
      <SliceZone slices={slices} components={components} />
    </main>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const docs = (await client.getAllByType(
    "ai_automation",
  )) as unknown as AiAutomationDocument[];
  return docs.map((d: AiAutomationDocument) => ({ uid: d.uid! }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const { uid } = await params;
  const doc = (await (client as any)
    .getByUID("ai_automation", uid)
    .catch(() => null)) as AiAutomationDocument | null;

  if (!doc) {
    return {
      title: "AI Automation",
      description: "Discover AI automation solutions from Lunim.",
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, [
    "ai-automation",
    uid,
  ]);
}
