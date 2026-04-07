/** Subscription tiers recognised by tech-suite */
export type SubscriptionTier = "iron" | "silver" | "gold" | string;

export interface SubscriptionState {
  hasAccess: boolean;
  hasRequestedAccess: boolean;
  tier: SubscriptionTier | null;
  pricePlanId: number | null;
  subscriptionId: number | null;
}

export interface RequestAccessResponse {
  success: boolean;
  message?: string;
  alreadyHandled?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  friendly_name: string;
  /** Always "deal-room" for registrations through this module */
  source: "deal-room";
}

export interface RegisterResponse {
  success?: boolean;
  message?: string;
  requiresConfirmation?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}
