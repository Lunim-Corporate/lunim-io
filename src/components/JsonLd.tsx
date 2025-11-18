// src/components/JsonLd.tsx
import type { WithContext } from "schema-dts";

export function JsonLd<T extends WithContext<any>>({ data }: { data: T }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}