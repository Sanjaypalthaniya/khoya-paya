import { prisma } from "@/lib/prisma";
import { CommunityError } from "./errors";

export async function togglePostReaction(userId:string, postId:string, reactionType:"LIKE"|"HELPFUL"|"HOPE"|"FOUND_IT"|"CELEBRATE") {
  return prisma.$transaction(async tx => {
    const post=await tx.communityPost.findUnique({where:{id:postId},select:{id:true,authorId:true,deletedAt:true}});
    if(!post||post.deletedAt) throw new CommunityError("NOT_FOUND","Post not found.",404);
    const existing=await tx.postReaction.findUnique({where:{postId_userId:{postId,userId}}});
    if(existing?.reactionType===reactionType){await tx.postReaction.delete({where:{id:existing.id}});await tx.communityPost.update({where:{id:postId},data:{reactionCount:{decrement:1}}});return {active:false,reactionType:null};}
    if(existing) await tx.postReaction.update({where:{id:existing.id},data:{reactionType}}); else {await tx.postReaction.create({data:{postId,userId,reactionType}});await tx.communityPost.update({where:{id:postId},data:{reactionCount:{increment:1}}});}
    return {active:true,reactionType};
  });
}

export async function toggleSave(userId:string,postId:string){return prisma.$transaction(async tx=>{const post=await tx.communityPost.findUnique({where:{id:postId},select:{id:true,deletedAt:true}});if(!post||post.deletedAt)throw new CommunityError("NOT_FOUND","Post not found.",404);const old=await tx.savedPost.findUnique({where:{userId_postId:{userId,postId}}});if(old){await tx.savedPost.delete({where:{id:old.id}});await tx.communityPost.update({where:{id:postId},data:{saveCount:{decrement:1}}});return {saved:false}}await tx.savedPost.create({data:{userId,postId}});await tx.communityPost.update({where:{id:postId},data:{saveCount:{increment:1}}});return {saved:true}})}

export async function createComment(authorId:string,postId:string,content:string,parentId?:string){return prisma.$transaction(async tx=>{const post=await tx.communityPost.findUnique({where:{id:postId},select:{id:true,allowComments:true,deletedAt:true}});if(!post||post.deletedAt)throw new CommunityError("NOT_FOUND","Post not found.",404);if(!post.allowComments)throw new CommunityError("FORBIDDEN","Comments are disabled for this post.",403);let depth=0;let rootCommentId:string|undefined;if(parentId){const parent=await tx.communityComment.findUnique({where:{id:parentId}});if(!parent||parent.postId!==postId)throw new CommunityError("NOT_FOUND","Parent comment not found.",404);depth=parent.depth+1;rootCommentId=parent.rootCommentId??parent.id;if(depth>5)throw new CommunityError("VALIDATION_ERROR","Maximum reply depth is 5.",400)}const c=await tx.communityComment.create({data:{postId,authorId,parentId,rootCommentId,depth,content:content.trim()}});await tx.communityPost.update({where:{id:postId},data:{commentCount:{increment:1}}});if(parentId)await tx.communityComment.update({where:{id:parentId},data:{replyCount:{increment:1}}});return c})}
