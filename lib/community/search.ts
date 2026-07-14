import { prisma } from "@/lib/prisma";
import { toPublicPostDto } from "./dto";
import { Prisma } from "@prisma/client";

export function normalizeSearchQuery(value:string){return value.normalize("NFKC").trim().replace(/\s+/g," ").toLowerCase().slice(0,120)}
export async function searchCommunity(input:{q:string;limit:number;cursor?:string;city?:string;state?:string;category?:string;postType?:string}){
 const q=normalizeSearchQuery(input.q); const where:Prisma.CommunityPostWhereInput={status:"PUBLISHED",visibility:"PUBLIC",deletedAt:null,moderationStatus:"APPROVED",...(input.city?{city:{contains:input.city,mode:"insensitive"}}:{}),...(input.state?{state:{contains:input.state,mode:"insensitive"}}:{}),...(input.category?{itemCategory:input.category as never}:{}),...(input.postType?{postType:input.postType as never}:{}),...(q?{OR:[{title:{contains:q,mode:"insensitive"}},{description:{contains:q,mode:"insensitive"}},{publicLocationName:{contains:q,mode:"insensitive"}},{city:{contains:q,mode:"insensitive"}},{state:{contains:q,mode:"insensitive"}},{tags:{some:{tag:{displayName:{contains:q,mode:"insensitive"}}}}}]}:{})};
 const rows=await prisma.communityPost.findMany({where,orderBy:[{isVerifiedPost:"desc"},{publishedAt:"desc"},{id:"desc"}],take:input.limit+1,...(input.cursor?{cursor:{id:input.cursor},skip:1}:{}),include:{author:{select:{id:true,name:true,verificationLevel:true,trustScore:true,createdAt:true}},media:{where:{deletedAt:null,processingStatus:"READY"},orderBy:{sortOrder:"asc"}},tags:{include:{tag:true}}}});const hasMore=rows.length>input.limit;const visible=hasMore?rows.slice(0,input.limit):rows;return {items:visible.map(toPublicPostDto),nextCursor:hasMore?visible.at(-1)?.id:null,hasMore};
}
