import {
  repositoryName,
  videoRoutes,
  createPrismicClientFactory,
} from "@lunim/prismic/client";

export { repositoryName };

/**
 * Prismic client for apps/video (video-next.lunim.io).
 * Routes: video → /, video_page → /:uid
 */
export const createClient = createPrismicClientFactory(videoRoutes);
