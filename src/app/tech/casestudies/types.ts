import type { Content } from "@prismicio/client";

export type CaseStudySmDocumentWithLegacy = Content.CaseStudySmDocument & {
  data: Content.CaseStudySmDocument["data"] &
    Partial<Pick<Content.CaseStudyDocumentData, "hero_image" | "hero_title">>;
};

export type HeroPrimaryFields =
  Partial<
    Pick<Content.CaseStudyDocumentData, "hero_image" | "hero_title">
  > &
  Partial<
    Pick<
      Content.HomepageDocumentDataBodyHerosectionSlicePrimary,
      "background_image" | "hero_title_part1"
    >
  > &
  Record<string, unknown>;

export type HeroLikeSlice = {
  slice_type?: string | null;
  primary?: HeroPrimaryFields | null;
};

