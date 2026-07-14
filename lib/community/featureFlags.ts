export const communityFeatureFlags = {
  developmentFixtures: process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_COMMUNITY_FIXTURES !== "false",
  publishing: true,
  reactions: false,
  comments: false,
  profiles: false,
} as const;
