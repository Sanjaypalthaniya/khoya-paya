import { leaderboard } from "@/lib/community/leaderboard";import { communityFailure,communitySuccess } from "@/lib/community/api";
export async function GET(){try{return communitySuccess("Suggested helpers",await leaderboard("TOP_HELPERS","WEEKLY",10))}catch(error){return communityFailure(error,"community.recommendations.helpers")}}
