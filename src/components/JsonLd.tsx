"use client";

import type { WithContext } from "schema-dts";

interface JsonLdProps<T extends WithContext<any>> {
  data: T;
}

export function JsonLd<T extends WithContext<any>>({ data }: JsonLdProps<T>) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify makes sure it's valid JSON, not JS
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}