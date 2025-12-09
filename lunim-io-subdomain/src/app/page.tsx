// src/app/page.tsx
import React from "react";
import { createClient } from "../prismicio"; 
import { SliceZone } from "@prismicio/react";
import { components } from "../slices";

export default async function Page() {
  const client = createClient();

  // Fetch homepage content from Prismic
  const homepage = await client.getSingle("homepage");

  return (
    <div>

      {/* TEMPORARY TEST — REMOVE LATER */}
      <div className="brand-test-text">
        IF YOU SEE RED TEXT → brand.css IS ACTIVE
      </div>

      <button className="brand-test-button px-4 py-2 rounded mt-4">
        BRAND TEST BUTTON
      </button>
      {/* END TEMP TEST */}

      <SliceZone slices={homepage.data.slices} components={components} />
    </div>
  );
}

