// Google Analytics 4 utility functions

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  // Create gtag script
  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(gtagScript);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };

  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID', {
      page_title: title || document.title,
      page_location: url,
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: { [key: string]: any }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: window.location.pathname,
      ...parameters,
    });
  }
};

// Track form submissions
export const trackFormSubmission = (formName: string, success: boolean = true) => {
  trackEvent('form_submit', {
    event_category: 'form',
    event_label: formName,
    value: success ? 1 : 0,
    success: success,
  });
};

// Track button clicks
export const trackButtonClick = (buttonName: string, section?: string) => {
  trackEvent('click', {
    event_category: 'button',
    event_label: buttonName,
    section: section || 'unknown',
  });
};

// Track navigation clicks
export const trackNavigation = (linkName: string, destination: string) => {
  trackEvent('navigate', {
    event_category: 'navigation',
    event_label: linkName,
    destination: destination,
  });
};

// Track scroll depth
export const trackScrollDepth = (percentage: number) => {
  trackEvent('scroll', {
    event_category: 'engagement',
    event_label: 'scroll_depth',
    value: percentage,
  });
};

// Track file downloads
export const trackDownload = (fileName: string, fileType: string) => {
  trackEvent('file_download', {
    event_category: 'download',
    event_label: fileName,
    file_type: fileType,
  });
};

// Track video interactions
export const trackVideoInteraction = (videoTitle: string, action: string, progress?: number) => {
  trackEvent('video_' + action, {
    event_category: 'video',
    event_label: videoTitle,
    value: progress,
  });
};

// Track search queries
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  trackEvent('search', {
    event_category: 'search',
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

// Track contact form interactions
export const trackContactForm = (action: string, formType: string = 'contact') => {
  trackEvent('contact_form_' + action, {
    event_category: 'contact',
    event_label: formType,
    form_type: formType,
  });
};