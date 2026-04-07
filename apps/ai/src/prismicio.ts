import {
  repositoryName,
  aiRoutes,
  createPrismicClientFactory,
} from "@lunim/prismic/client";

export { repositoryName };

/**
 * Prismic client for apps/ai (ai.lunim.io).
 * Routes: ai_automation → /, ai_automation_page → /:uid
 */
export const createClient = createPrismicClientFactory(aiRoutes);
