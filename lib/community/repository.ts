import { Prisma, type CommunityPostStatus } from "@prisma/client";import { prisma } from "@/lib/prisma";import { PUBLIC_POST_WHERE,publicMediaInclude } from "./publication";
const authorInclude={select:{id:true,name:true,verificationLevel:true,trustScore:true,createdAt:true}} as const;
const tagsInclude={include:{tag:true}} as const;
export const communityPostInclude={author:authorInclude,media:publicMediaInclude,tags:tagsInclude} satisfies Prisma.CommunityPostInclude;
export const ownerCommunityPostInclude={author:authorInclude,media:{where:{deletedAt:null},orderBy:{sortOrder:"asc"}},tags:tagsInclude} satisfies Prisma.CommunityPostInclude;
export type CommunityPostRecord=Prisma.CommunityPostGetPayload<{include:typeof communityPostInclude}>;
export async function findPostById(id:string){return prisma.communityPost.findFirst({where:{id,...PUBLIC_POST_WHERE},include:communityPostInclude})}
export async function findOwnedPost(id:string,authorId:string){return prisma.communityPost.findFirst({where:{id,authorId,deletedAt:null},include:ownerCommunityPostInclude})}
export async function listOwnedPosts(authorId:string){return prisma.communityPost.findMany({where:{authorId,deletedAt:null},orderBy:{updatedAt:"desc"},include:ownerCommunityPostInclude})}
export async function listFeed(args:{where:Prisma.CommunityPostWhereInput;take:number;cursor?:string;orderBy:Prisma.CommunityPostOrderByWithRelationInput[]}){return prisma.communityPost.findMany({where:{AND:[PUBLIC_POST_WHERE,args.where]},take:args.take+1,...(args.cursor?{cursor:{id:args.cursor},skip:1}:{}),orderBy:args.orderBy,include:communityPostInclude})}
export async function setPostStatus(id:string,authorId:string,status:CommunityPostStatus,data:Prisma.CommunityPostUpdateInput={}){return prisma.communityPost.update({where:{id,authorId},data:{status,...data},include:communityPostInclude})}
