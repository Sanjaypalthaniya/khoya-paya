export type CommunityPostType = "LOST_ITEM" | "FOUND_ITEM" | "MISSING_PET" | "LOST_DOCUMENT" | "FOUND_DOCUMENT" | "VEHICLE" | "NEED_HELP" | "RECOVERED_ITEM" | "SUCCESS_STORY" | "COMMUNITY_UPDATE";
export type CommunityPostStatus = "LOST" | "FOUND" | "CLAIM_PENDING" | "VERIFICATION_PENDING" | "RECOVERED" | "CLOSED";
export type TrustBadgeType = "VERIFIED_USER" | "TRUSTED_FINDER" | "COMMUNITY_HERO" | "TOP_HELPER" | "PREMIUM" | "ORGANIZATION" | "NGO" | "POLICE_VERIFIED" | "ADMIN" | "SUCCESSFUL_RETURN" | "EARLY_MEMBER";
export type ReactionType = "LIKE" | "HELPFUL" | "HOPE" | "FOUND_IT" | "CELEBRATE";

export type CommunityAuthor = { id: string; displayName: string; username: string; initials: string; verified?: boolean; badges?: TrustBadgeType[]; location?: string };
export type CommunityMedia = { id: string; kind: "IMAGE" | "VIDEO"; src: string; alt: string; thumbnail?: string };
export type CommunityComment = { id: string; author: CommunityAuthor; body: string; createdAt: string; role?: "OWNER" | "POSSIBLE_FINDER" | "VERIFIED_HELPER" | "ADMIN"; replies?: CommunityComment[] };
export type CommunityPost = { id: string; type: CommunityPostType; status: CommunityPostStatus; author: CommunityAuthor; title: string; description: string; location?: string; eventDate?: string; createdAt: string; visibility: "PUBLIC" | "COMMUNITY"; category: string; reward?: string; tags: string[]; media: CommunityMedia[]; reactions: Partial<Record<ReactionType, number>>; commentCount: number; viewCount: number; comments?: CommunityComment[] };
export type FeedState = "INITIAL_LOADING" | "LOADED" | "REFRESHING" | "FILTERED" | "EMPTY" | "SEARCH_RESULT" | "ERROR" | "OFFLINE" | "END";

export type ComposerDraft = { type: CommunityPostType; category: string; title: string; description: string; location: string; date: string; time: string; reward: string; tags: string; privacy: "PUBLIC" | "PRIVATE" | "UNLISTED"; contactPreference: "PLATFORM_MESSAGE" | "COMMENTS" | "BOTH" | "NO_DIRECT_CONTACT"; media: Array<{ id: string; name: string; url: string; kind: "IMAGE" | "VIDEO"; progress: number; error?: string; file?: File }> };
