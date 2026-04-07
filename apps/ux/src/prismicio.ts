import {
  repositoryName,
  uxRoutes,
  createPrismicClientFactory,
} from "@lunim/prismic/client";

export { repositoryName };

/**
 * Prismic client for apps/ux (ux.lunim.io).
 * Routes: ux → /, ux_page → /:uid
 */
export const createClient = createPrismicClientFactory(uxRoutes);
