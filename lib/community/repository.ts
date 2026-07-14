import { Prisma, type CommunityPostStatus } from "@prisma/client";import { prisma } from "@/lib/prisma";
export const communityPostInclude={author:{select:{id:true,name:true,verificationLevel:true,trustScore:true,createdAt:true}},media:{where:{deletedAt:null,processingStatus:"READY"},orderBy:{sortOrder:"asc"}},tags:{include:{tag:true}}} satisfies Prisma.CommunityPostInclude;
export type CommunityPostRecord=Prisma.CommunityPostGetPayload<{include:typeof communityPostInclude}>;
export async function findPostById(id:string){return prisma.communityPost.findUnique({where:{id},include:communityPostInclude})}
export async function findOwnedPost(id:string,authorId:string){return prisma.communityPost.findFirst({where:{id,authorId,deletedAt:null},include:communityPostInclude})}
export async function listOwnedPosts(authorId:string){return prisma.communityPost.findMany({where:{authorId,deletedAt:null},orderBy:{updatedAt:"desc"},include:communityPostInclude})}
export async function listFeed(args:{where:Prisma.CommunityPostWhereInput;take:number;cursor?:string;orderBy:Prisma.CommunityPostOrderByWithRelationInput[]}){return prisma.communityPost.findMany({where:args.where,take:args.take+1,...(args.cursor?{cursor:{id:args.cursor},skip:1}:{}),orderBy:args.orderBy,include:communityPostInclude})}
export async function setPostStatus(id:string,authorId:string,status:CommunityPostStatus,data:Prisma.CommunityPostUpdateInput={}){return prisma.communityPost.update({where:{id,authorId},data:{status,...data},include:communityPostInclude})}
