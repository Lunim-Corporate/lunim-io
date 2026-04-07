import {
  repositoryName,
  mainRoutes,
  mainLinkResolver,
  createPrismicClientFactory,
} from "@lunim/prismic/client";

export { repositoryName };
export { mainLinkResolver as linkResolver };

/**
 * Prismic client for apps/main (lunim.io).
 * Uses the full route map covering all document types.
 */
export const createClient = createPrismicClientFactory(mainRoutes);
