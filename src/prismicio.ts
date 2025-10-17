import {
  createClient as baseCreateClient,
  type ClientConfig,
  type Route,
} from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import sm from "../slicemachine.config.json";

/**
 * Attempts to extract a valid Prismic repository name from an environment string.
 * Supports direct repository names or full API endpoints. Returns `undefined`
 * if the value does not resemble a valid name.
 */
const parseRepositoryName = (value: string | undefined | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Handle full Prismic URLs such as https://repo-name.cdn.prismic.io/api/v2
  const endpointMatch = trimmed.match(
    /^https?:\/\/([a-z0-9-]+)(?:\.[^/]+)?\.prismic\.io/i,
  );
  if (endpointMatch) {
    return endpointMatch[1];
  }

  // Accept plain repository names containing only alphanumerics and hyphens.
  if (/^[a-z0-9-]+$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return undefined;
};

const envRepositoryName =
  parseRepositoryName(process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT) ??
  parseRepositoryName(process.env.PRISMIC_REPOSITORY_NAME) ??
  parseRepositoryName(process.env.PRISMIC_ENVIRONMENT) ??
  parseRepositoryName(process.env.PRISMIC_API_ENDPOINT);

/**
 * The project's Prismic repository name.
 */
export const repositoryName = envRepositoryName || sm.repositoryName;

/**
 * A list of Route Resolver objects that define how a document's `url` field is resolved.
 *
 * {@link https://prismic.io/docs/route-resolver#route-resolver}
 */
// TODO: Update the routes array to match your project's route structure.
const routes: Route[] = [
  { type: "mainpage", path: "/" },
  { type: "our_team_page", path: "/our-team" },
  { type: "homepage", path: "/tech" },
  { type: "academy", path: "/academy" },
  { type: "film", path: "/film" },
  { type: "tabb", path: "/tabb" },
  // Case studies under /tech/casestudies/:uid
  { type: "case_study_sm", path: "/tech/casestudies/:uid" },
  // Privacy policy:
  { type: "privacy_policy_sm", path: "/privacy-policy" },
  { type: "blog_home_page", path: "/blog" },
  { type: "blog_post", path: "/blog/:uid" },
];

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config - Configuration for the Prismic client.
 */
export const createClient = (config: ClientConfig = {}) => {
  const client = baseCreateClient(repositoryName, {
    routes,
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? { next: { tags: ["prismic"] }, cache: "force-cache" }
        : { next: { revalidate: 5 } },
    ...config,
  });

  enableAutoPreviews({ client });

  return client;
};
