import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";

export const revalidate = 60;

export default async function Page() {
  const client = createClient();
  const doc = await client
    .getSingle<Content.PrivacyPolicySmDocument>("privacy_policy_sm")
    .catch(() => null);

  if (!doc || !Array.isArray(doc.data.slices)) {
    return (
      <main className="p-6 text-white bg-black">
        Privacy Policy not published.
      </main>
    );
  }

  return (
    <main className="bg-[#0f172a] text-white min-h-screen p-8">
      <SliceZone slices={doc.data.slices} components={components} />
    </main>
  );
}
