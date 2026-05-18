export type AnalyticsEvent = 
  | 'product_view'
  | 'add_to_cart'
  | 'checkout_start'
  | 'purchase_complete'
  | 'community_click'
  | 'pitch_create'
  | 'page_view';

export interface AnalyticsPayload {
  [key: string]: any;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  public track(event: AnalyticsEvent, payload?: AnalyticsPayload) {
    if (!this.isInitialized) this.init();

    // Stubbed: wire to Mixpanel / Amplitude / Google Analytics when ready
    const _enriched = {
      event,
      ...payload,
      timestamp: new Date().toISOString(),
      url: globalThis.window === undefined ? '' : globalThis.location.href,
    };
  }

  public identify(_userId: string, _traits?: Record<string, unknown>) {
    // Stubbed: wire to analytics provider when ready
  }
}

export const analytics = AnalyticsService.getInstance();
