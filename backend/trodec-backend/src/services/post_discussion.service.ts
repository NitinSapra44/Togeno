import { supabaseAdmin } from "../config";
import { ApiError } from "../utils";
import { logger } from "../utils/logger";
import { notificationService } from "./notification.service";

// These types match the existing controller expectations — postId maps to the
// associated product_id so both consumer and expert share one discussion thread.
export interface PostDiscussion {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; fullName: string | null; avatarUrl: string | null; role?: string };
  replies?: PostDiscussionReply[];
  likedByMe?: boolean;
}

export interface PostDiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; fullName: string | null; avatarUrl: string | null; role?: string };
  likedByMe?: boolean;
}

class PostDiscussionService {

  // Resolve post → product so all writes go to the shared product_discussions table.
  private async getProductIdForPost(postId: string): Promise<string> {
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("product_id")
      .eq("id", postId)
      .single();

    if (error || !data) throw new ApiError("Post not found", 404);
    const productId = (data as any).product_id as string | null;
    if (!productId) throw new ApiError("Post has no associated product", 400);
    return productId;
  }

  async listForPost(postId: string): Promise<PostDiscussion[]> {
    const productId = await this.getProductIdForPost(postId);

    const { data, error } = await supabaseAdmin
      .from("product_discussions")
      .select(`
        *,
        author:profiles!product_discussions_user_id_fkey(id, full_name, avatar_url, role),
        replies:discussion_replies(
          *,
          author:profiles!discussion_replies_user_id_fkey(id, full_name, avatar_url, role)
        )
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("listForPost error", error);
      throw new ApiError("Failed to fetch discussions", 500);
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      postId,
      userId: row.user_id,
      content: row.content,
      likesCount: row.likes_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: row.author
        ? { id: row.author.id, fullName: row.author.full_name, avatarUrl: row.author.avatar_url, role: row.author.role }
        : undefined,
      replies: (row.replies ?? []).map((r: any) => ({
        id: r.id,
        discussionId: r.discussion_id,
        userId: r.user_id,
        content: r.content,
        likesCount: r.likes_count,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        author: r.author
          ? { id: r.author.id, fullName: r.author.full_name, avatarUrl: r.author.avatar_url, role: r.author.role }
          : undefined,
      })),
    }));
  }

  async create(postId: string, userId: string, content: string): Promise<PostDiscussion> {
    const productId = await this.getProductIdForPost(postId);

    const { data, error } = await supabaseAdmin
      .from("product_discussions")
      .insert({ product_id: productId, user_id: userId, content })
      .select(`*, author:profiles!product_discussions_user_id_fkey(id, full_name, avatar_url, role)`)
      .single();

    if (error) {
      logger.error("create post discussion error", error);
      throw new ApiError("Failed to create discussion", 500);
    }

    return {
      id: (data as any).id,
      postId,
      userId: (data as any).user_id,
      content: (data as any).content,
      likesCount: (data as any).likes_count,
      createdAt: (data as any).created_at,
      updatedAt: (data as any).updated_at,
      author: (data as any).author
        ? { id: (data as any).author.id, fullName: (data as any).author.full_name, avatarUrl: (data as any).author.avatar_url, role: (data as any).author.role }
        : undefined,
      replies: [],
    };
  }

  async delete(discussionId: string, userId: string): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from("product_discussions")
      .select("user_id")
      .eq("id", discussionId)
      .single();

    if (error || !data) throw new ApiError("Discussion not found", 404);
    if ((data as any).user_id !== userId) throw new ApiError("Not authorised", 403);

    const { error: delError } = await supabaseAdmin
      .from("product_discussions")
      .delete()
      .eq("id", discussionId);

    if (delError) throw new ApiError("Failed to delete discussion", 500);
  }

  async toggleLike(discussionId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data: existing } = await supabaseAdmin
      .from("discussion_likes")
      .select("id")
      .eq("discussion_id", discussionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from("discussion_likes").delete().eq("id", (existing as any).id);
      await supabaseAdmin.rpc("decrement_discussion_likes", { discussion_id_arg: discussionId });
    } else {
      await supabaseAdmin.from("discussion_likes").insert({ discussion_id: discussionId, user_id: userId });
      await supabaseAdmin.rpc("increment_discussion_likes", { discussion_id_arg: discussionId });
    }

    const { data } = await supabaseAdmin
      .from("product_discussions")
      .select("likes_count")
      .eq("id", discussionId)
      .single();

    return { liked: !existing, likesCount: (data as any)?.likes_count ?? 0 };
  }

  async createReply(discussionId: string, userId: string, content: string, postId?: string): Promise<PostDiscussionReply> {
    const { data, error } = await supabaseAdmin
      .from("discussion_replies")
      .insert({ discussion_id: discussionId, user_id: userId, content })
      .select(`*, author:profiles!discussion_replies_user_id_fkey(id, full_name, avatar_url, role)`)
      .single();

    if (error) {
      logger.error("createReply error", error);
      throw new ApiError("Failed to create reply", 500);
    }

    const r: PostDiscussionReply = {
      id: (data as any).id,
      discussionId: (data as any).discussion_id,
      userId: (data as any).user_id,
      content: (data as any).content,
      likesCount: (data as any).likes_count,
      createdAt: (data as any).created_at,
      updatedAt: (data as any).updated_at,
      author: (data as any).author
        ? { id: (data as any).author.id, fullName: (data as any).author.full_name, avatarUrl: (data as any).author.avatar_url, role: (data as any).author.role }
        : undefined,
    };

    this.notifyDiscussionOwner(discussionId, userId, r.author?.fullName ?? "Someone", postId).catch(() => {});
    return r;
  }

  private async notifyDiscussionOwner(
    discussionId: string,
    replierId: string,
    replierName: string,
    postId?: string
  ): Promise<void> {
    const { data: discussion } = await supabaseAdmin
      .from("product_discussions")
      .select("user_id, content, product_id")
      .eq("id", discussionId)
      .single();

    if (!discussion || (discussion as any).user_id === replierId) return;

    const owner = (discussion as any).user_id as string;
    const snippet = ((discussion as any).content as string).slice(0, 60);
    const ellipsis = ((discussion as any).content as string).length > 60 ? "…" : "";
    const notifData: Record<string, unknown> = {
      discussionId,
      productId: (discussion as any).product_id,
      replierId,
    };
    if (postId) notifData.postId = postId;

    await notificationService.create(
      owner,
      "discussion_reply",
      "New reply on your discussion",
      `${replierName} replied to: "${snippet}${ellipsis}"`,
      notifData
    );
  }

  async toggleReplyLike(replyId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data: existing } = await supabaseAdmin
      .from("discussion_reply_likes")
      .select("id")
      .eq("reply_id", replyId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from("discussion_reply_likes").delete().eq("id", (existing as any).id);
      await supabaseAdmin.rpc("decrement_reply_likes", { reply_id_arg: replyId });
    } else {
      await supabaseAdmin.from("discussion_reply_likes").insert({ reply_id: replyId, user_id: userId });
      await supabaseAdmin.rpc("increment_reply_likes", { reply_id_arg: replyId });
    }

    const { data } = await supabaseAdmin
      .from("discussion_replies")
      .select("likes_count")
      .eq("id", replyId)
      .single();

    return { liked: !existing, likesCount: (data as any)?.likes_count ?? 0 };
  }
}

export const postDiscussionService = new PostDiscussionService();
