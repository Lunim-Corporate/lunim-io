"use client";

import React from "react";
import type { WithContext } from "schema-dts";

interface JsonLdProps<T extends WithContext<any>> {
  data: T;
}

export function JsonLd<T extends WithContext<any>>({ data }: JsonLdProps<T>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
