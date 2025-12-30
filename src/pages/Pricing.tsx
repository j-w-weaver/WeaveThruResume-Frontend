import "./pricing.css";
import "../dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import subscriptionService, {
  type SubscriptionPlan,
} from "../services/subscriptionService";
import { getErrorMessage } from "../utils/api";
import { useToast } from "../context/ToastContext";

type BillingInterval = "monthly" | "3month" | "6month" | "yearly";

export function Pricing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("3month");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
    { name: "Applications", path: "/applications", icon: "📋" },
  ];

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (plans.length > 0) {
      console.log("📊 Loaded plans:", plans);
      console.log("💰 Pro plan savings:", {
        "3month": plans[1]?.threeMonthSavingsPercent,
        "6month": plans[1]?.sixMonthSavingsPercent,
        yearly: plans[1]?.yearlySavingsPercent,
      });
    }
  }, [plans]);

  const loadPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const plansData = await subscriptionService.getPlans();
      console.log("✅ Plans loaded from API:", plansData);
      setPlans(plansData);
    } catch (err) {
      console.error("❌ Failed to load plans:", err);
      showToast(
        `Failed to load pricing plans: ${getErrorMessage(err)}`,
        "error"
      );
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleBillingChange = (interval: BillingInterval) => {
    console.log("🔄 Billing interval changed to:", interval);
    setBillingInterval(interval);
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan.tier === "Free") {
      navigate("/register");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    const priceId =
      billingInterval === "monthly"
        ? plan.monthlyPriceId
        : billingInterval === "3month"
        ? plan.threeMonthPriceId
        : billingInterval === "6month"
        ? plan.sixMonthPriceId
        : plan.yearlyPriceId;

    // ✅ Add this debug logging
    console.log("🎯 Selected plan:", {
      tier: plan.tier,
      interval: billingInterval,
      priceId: priceId,
      allPriceIds: {
        monthly: plan.monthlyPriceId,
        "3month": plan.threeMonthPriceId,
        "6month": plan.sixMonthPriceId,
        yearly: plan.yearlyPriceId,
      },
    });

    if (!priceId) {
      showToast(
        "This billing interval is not available yet. Please try another option.",
        "error"
      );
      return;
    }

    setIsLoading(plan.tier);

    try {
      const session = await subscriptionService.createCheckoutSession(
        priceId,
        `${window.location.origin}/dashboard?checkout=success`,
        `${window.location.origin}/pricing?checkout=cancelled`
      );

      window.location.href = session.url;
    } catch (err) {
      showToast(`Failed to start checkout: ${getErrorMessage(err)}`, "error");
      setIsLoading(null);
    }
  };

  return (
    <div className="pricing-page">
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      <div
        className={`sidebar-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="nav-logo">
            <div className="nav-icon">W</div>
            <span className="nav-brand">WeavThru</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`sidebar-nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || "Guest"}</div>
              <div className="sidebar-user-email">
                {user?.email || "Not logged in"}
              </div>
            </div>
            {user && (
              <button
                onClick={logout}
                className="sidebar-logout"
                title="Logout"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pricing-main">
        <div className="pricing-header">
          <h1>Choose Your Plan 💎</h1>
          <p>
            Get AI-powered resume optimization and land your dream job faster
          </p>

          {/* Billing Toggle */}
          <div className="billing-toggle">
            <button
              className={billingInterval === "monthly" ? "active" : ""}
              onClick={() => handleBillingChange("monthly")}
            >
              Monthly
            </button>
            <button
              className={billingInterval === "3month" ? "active" : ""}
              onClick={() => handleBillingChange("3month")}
            >
              3 Months
              {plans.length > 1 && plans[1]?.threeMonthSavingsPercent > 0 && (
                <span className="savings-badge">
                  Save {plans[1].threeMonthSavingsPercent}%
                </span>
              )}
            </button>
            <button
              className={billingInterval === "6month" ? "active" : ""}
              onClick={() => handleBillingChange("6month")}
            >
              6 Months
              {plans.length > 1 && plans[1]?.sixMonthSavingsPercent > 0 && (
                <span className="savings-badge">
                  Save {plans[1].sixMonthSavingsPercent}%
                </span>
              )}
            </button>
            <button
              className={billingInterval === "yearly" ? "active" : ""}
              onClick={() => handleBillingChange("yearly")}
            >
              Yearly
              {plans.length > 1 && plans[1]?.yearlySavingsPercent > 0 && (
                <span className="savings-badge">
                  Save {plans[1].yearlySavingsPercent}%
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="pricing-content">
          {isLoadingPlans && (
            <div className="pricing-loading">
              <div className="loading-spinner"></div>
              <p>Loading pricing plans...</p>
            </div>
          )}

          {!isLoadingPlans && (
            <div className="pricing-grid">
              {plans.map((plan) => {
                const price =
                  billingInterval === "monthly"
                    ? plan.monthlyPrice ?? 0
                    : billingInterval === "3month"
                    ? plan.threeMonthPrice ?? 0
                    : billingInterval === "6month"
                    ? plan.sixMonthPrice ?? 0
                    : plan.yearlyPrice ?? 0;

                const savings =
                  billingInterval === "3month"
                    ? plan.threeMonthSavings ?? 0
                    : billingInterval === "6month"
                    ? plan.sixMonthSavings ?? 0
                    : billingInterval === "yearly"
                    ? plan.yearlySavings ?? 0
                    : 0;

                const intervalText =
                  billingInterval === "monthly"
                    ? "/mo"
                    : billingInterval === "3month"
                    ? " (3 months)"
                    : billingInterval === "6month"
                    ? " (6 months)"
                    : "/yr";

                // Debug logging for each plan
                console.log(`Plan ${plan.name}, interval ${billingInterval}:`, {
                  price,
                  savings,
                });

                return (
                  <div
                    key={plan.tier}
                    className={`pricing-card ${
                      plan.isPopular || plan.tier === "Premium" ? "popular" : ""
                    }`}
                  >
                    {/* Show "Most Popular" on Pro */}
                    {plan.isPopular && plan.tier !== "Premium" && (
                      <div className="popular-badge">Most Popular</div>
                    )}

                    {/* Show "Highest Savings" on Premium */}
                    {plan.tier === "Premium" && (
                      <div className="popular-badge highest-savings-badge">
                        Highest Savings
                      </div>
                    )}

                    <div className="pricing-card-header">
                      <h3>{plan.name}</h3>
                      <div className="pricing-card-price">
                        <span className="price-amount">
                          ${price.toFixed(plan.tier === "Free" ? 0 : 2)}
                        </span>
                        <span className="price-interval">
                          {plan.tier === "Free" ? "" : intervalText}
                        </span>
                      </div>
                      {plan.tier !== "Free" && savings > 0 && (
                        <div className="price-savings">
                          Save ${savings.toFixed(2)} total
                        </div>
                      )}
                      <p className="plan-description">{plan.description}</p>
                    </div>

                    <ul className="pricing-card-features">
                      {plan.features.map((feature, index) => (
                        <li key={index}>
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isLoading === plan.tier}
                      className={`btn ${
                        plan.tier !== "Free" ? "btn-primary" : "btn-secondary"
                      } btn-full`}
                    >
                      {isLoading === plan.tier
                        ? "Loading..."
                        : plan.tier === "Free"
                        ? "Get Started Free"
                        : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* FAQ Section */}
          <div className="pricing-faq">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h4>Can I cancel anytime?</h4>
                <p>
                  Yes! Cancel anytime from your account settings. No long-term
                  commitments.
                </p>
              </div>
              <div className="faq-item">
                <h4>What happens when I hit the free tier limits?</h4>
                <p>
                  You'll be prompted to upgrade to Pro to continue using
                  unlimited features.
                </p>
              </div>
              <div className="faq-item">
                <h4>Do you offer refunds?</h4>
                <p>
                  Yes, we offer a 7-day money-back guarantee on all paid plans.
                </p>
              </div>
              <div className="faq-item">
                <h4>Can I switch plans later?</h4>
                <p>
                  Absolutely! Upgrade or downgrade anytime from your account
                  settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
