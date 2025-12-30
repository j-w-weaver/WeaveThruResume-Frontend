import api from "../utils/api";

// ============================================================
// These types match your backend DTOs exactly
// ============================================================

export interface UsageLimits {
  analysesUsed: number;
  analysesLimit: number;
  resumesUsed: number;
  resumesLimit: number;
  jobsUsed: number;
  jobsLimit: number;
  applicationsUsed: number;
  applicationsLimit: number;
  // Computed properties from backend
  analysesUnlimited: boolean;
  resumesUnlimited: boolean;
  jobsUnlimited: boolean;
  applicationsUnlimited: boolean;
  analysesRemaining: number;
  resumesRemaining: number;
  jobsRemaining: number;
  applicationsRemaining: number;
}

export interface SubscriptionStatus {
  tier: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  cancelAtPeriodEnd: boolean;
  usage: UsageLimits;
  features: string[];
}

export interface TierLimits {
  analysesLimit: number;
  resumesLimit: number;
  jobsLimit: number;
  applicationsLimit: number;
}

export interface SubscriptionPlan {
  tier: string;
  name: string;
  description: string;
  monthlyPrice: number;
  threeMonthPrice: number;
  sixMonthPrice: number;
  yearlyPrice: number;
  monthlyPriceId: string | null;
  threeMonthPriceId: string | null;
  sixMonthPriceId: string | null;
  yearlyPriceId: string | null;
  features: string[];
  limits: TierLimits;
  isPopular: boolean;
  hasHighestSavings: boolean;
  threeMonthSavings: number;
  threeMonthSavingsPercent: number;
  sixMonthSavings: number;
  sixMonthSavingsPercent: number;
  yearlySavings: number;
  yearlySavingsPercent: number;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}

const subscriptionService = {
  /**
   * Get current user's subscription status and usage
   */
  async getStatus(): Promise<SubscriptionStatus> {
    const response = await api.get<SubscriptionStatus>("/subscription/status");
    return response.data;
  },

  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get<SubscriptionPlan[]>("/subscription/plans");
    return response.data;
  },

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSessionResponse> {
    const response = await api.post<CheckoutSessionResponse>(
      "/subscription/create-checkout-session",
      {
        priceId,
        successUrl,
        cancelUrl,
      }
    );
    return response.data;
  },

  /**
   * Create Stripe customer portal session for managing subscription
   */
  async createPortalSession(returnUrl: string): Promise<PortalSessionResponse> {
    const response = await api.post<PortalSessionResponse>(
      "/subscription/create-portal-session",
      {
        returnUrl,
      }
    );
    return response.data;
  },

  /**
   * Verify a checkout session after redirect
   */
  async verifySession(sessionId: string): Promise<{
    status: string;
    paymentStatus: string;
    customerEmail: string;
  }> {
    const response = await api.get(`/subscription/verify-session/${sessionId}`);
    return response.data;
  },
};

export default subscriptionService;
