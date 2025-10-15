export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export const pageview = (url: string) => {
  if (!GA_ID || typeof window === "undefined") return;
  (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag?.(
    "config",
    GA_ID,
    {
      page_path: url,
    }
  );
};

export const event = (
  action: string,
  params: Record<string, unknown> = {}
) => {
  if (!GA_ID || typeof window === "undefined") return;
  (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag?.(
    "event",
    action,
    params
  );
};
