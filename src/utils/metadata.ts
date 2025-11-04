import { ResolvingMetadata } from "next";

type MetaFields = {
  title: string;
  description: string;
  keywords: string;
};

type DynamicRouteMap = Record<string, MetaFields>;

type MetaDataInfo = Record<string, MetaFields | DynamicRouteMap>;

// Get all relevant meta tags from parent metadata (see layout.tsx)
export async function pickBaseMetadata(parent: ResolvingMetadata) {
  const resolved = await parent;

  const type = resolved.openGraph && "type" in resolved.openGraph ? resolved.openGraph.type : undefined;

  return {
    title: resolved.title,
    description: resolved.description,
    keywords: resolved.keywords,
    openGraph: resolved.openGraph
      ? {
          type: type,
          locale: resolved.openGraph.locale,
          siteName: resolved.openGraph.siteName,
        }
      : undefined,
  };
}

// Define metadata for various routes
export const metaDataInfoArr: MetaDataInfo = {
  "/": {
    title: "Home",
    description: "Lunim Home Page",
    keywords: "home,"
  },
  "/blog": {
    title: "Blog",
    description: "Lunim Blog",
    keywords: "blog,"
  },
  "/blog/authors": {
    title: "Authors",
    description: "Browse the Lunim blog authors and discover articles written by our team.",
    keywords: "authors, blog,"
  },
  "/tabb": {
    title: "Tabb",
    description: "Tabb Page",
    keywords: "tabb,"
  },
  "/privacy-policy": {
    title: "Privacy Policy",
    description: "Privacy Policy Page",
    keywords: "privacy,"
  },
  "/our-team": {
    title: "Our Team",
    description: "Meet our team",
    keywords: "team,"
  },
  "/media": {
    title: "Media",
    description: "Explore our film collection",
    keywords: "film,"
  },
  "/digital": {
    title: "Digital",
    description: "Explore our digital collection",
    keywords: "digital,"
  },
  "/digital/case-studies": {
    title: "Case Studies",
    description: "List of Lunim Case Studies",
    keywords: "case studies,"
  },
  "/digital/[uid]": {
    "/discovery": {
      title: "Digital",
      description: "digital",
      keywords: ""
    },
    "/ux": {
      title: "Ux",
      description: "Ux",
      keywords: ""
    },
    "/ai": {
      title: "Ai",
      description: "Ai",
      keywords: ""
    },
    "/web3": {
      title: "Web3",
      description: "Web3",
      keywords: ""
    },
  },
  "/academy": {
    title: "Academy",
    description: "Explore our academy collection",
    keywords: "academy,"
  },
  "/academy/[uid]": {
    "/marketing": {
      title: "Marketing",
      description: "Marketing",
      keywords: ""
    },
    "/engineering": {
      title: "Engineering",
      description: "Engineering",
      keywords: ""
    },
    "/design": {
      title: "Design",
      description: "Design",
      keywords: ""
    },
    "/hr": {
      title: "Hr",
      description: "Hr",
      keywords: ""
    },
    "/filmmaking": {
      title: "Filmmaking",
      description: "Filmmaking",
      keywords: ""
    }
  }
};

export const getMetaDataInfo = async (
  pathname: string,
  parentMetaData: ResolvingMetadata,
  slug?: string,
  url: string | undefined = process.env.NEXT_PUBLIC_WEBSITE_URL,
): Promise<ResolvingMetadata | Record<string, unknown>> => {

  // Get parent metadata
  const { keywords: parentKeywords, title: parentTitle, description: parentDescription, openGraph } = await pickBaseMetadata(parentMetaData);

  // Dynamic routes (NOTE: does not include `blog/[uid]` and `blog/authors/[uid]` - information will be fetched from Prismic)
  for (const key in metaDataInfoArr) {
    const item = metaDataInfoArr[key];
    // Only consider dynamic route records and ensure slug exists
    if (key.includes("[") && typeof slug === "string" && item && (`/${slug}` in item)) {
      const dynamicRouteKey = (item as DynamicRouteMap)[`/${slug}`];
      if (dynamicRouteKey) {
        const metaTitle = dynamicRouteKey.title || parentTitle;
        const metaDescription = dynamicRouteKey.description || parentDescription;
        const metaKeywords = `${dynamicRouteKey.keywords ?? ""} ${parentKeywords ?? ""}`.trim();
        const canonicalUrl = `${url}${pathname.split("/")[1]}/${slug}`;

        return {
          ...parentMetaData,
          title: metaTitle,
          description: metaDescription,
          keywords: metaKeywords,
          openGraph: {
            ...openGraph,
            title: metaTitle,
            description: `${metaDescription}`,
            url: canonicalUrl,
          },
        };
      }
    }
  }

  // If it is an exact match
  // E.g., /our-team, /privacy-policy
  if (metaDataInfoArr[pathname]) {
    const slug = pathname.slice(1);
    const metaTitle = (metaDataInfoArr[pathname] as MetaFields).title || parentTitle;
    const metaDescription = (metaDataInfoArr[pathname] as MetaFields).description || parentDescription;
    const metaKeywords = `${(metaDataInfoArr[pathname] as MetaFields).keywords ?? ""} ${parentKeywords ?? ""}`.trim();

    return {
      ...parentMetaData,
      title: metaTitle,
      description: metaDescription,
      keywords: metaKeywords,
      openGraph: {
        ...openGraph,
        title: metaTitle,
        description: `${metaDescription}`,
        url: `${url}${slug}`,
      },
    }
  }
    // Fallback: return parent metadata if nothing matched
    return parentMetaData;
}