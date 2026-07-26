export const motion = {
  duration: {
    instant: 0.12,
    interaction: 0.2,
    card: 0.26,
    reveal: 0.48,
    section: 0.68,
    hero: 0.92,
    overlay: 0.3,
    success: 0.72,
  },
  ease: {
    fast: "power2.out",
    smooth: "power3.out",
    soft: "power2.inOut",
    entrance: "expo.out",
    exit: "power2.in",
  },
  distance: {
    small: 12,
    section: 24,
    hero: 32,
  },
  stagger: {
    tight: 0.045,
    normal: 0.075,
    hero: 0.11,
  },
} as const;

export const motionSelectors = {
  hero: [
    ".page-hero > *",
    ".kp-hero-copy > *",
    ".login-heading > *",
    ".auth-layout-copy > *",
    ".dashboard-title > *",
  ].join(","),
  sections: [
    "main > section:not(.kp-hero)",
    ".dashboard-content > *",
    ".admin-shell > *",
  ].join(","),
  cards: [
    ".item-card",
    ".dashboard-item-card",
    ".community-post-card",
    ".conversation-card",
    ".notification-card",
    ".dashboard-message-card",
    ".empty-state",
    ".form-section-card",
    ".pricing-card",
    ".about-principles > article",
    ".support-category-grid > article",
    ".kp-step-grid > article",
    ".kp-use-card",
    ".kp-resource-card",
  ].join(","),
};
