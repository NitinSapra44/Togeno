import { supabaseAdmin } from "../config";
import { ApiError } from "../utils";
import { logger } from "../utils/logger";
import { notificationService } from "./notification.service";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Discussion {
  id: string;
  productId: string;
  userId: string;
  content: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  // joined
  author?: { id: string; fullName: string | null; avatarUrl: string | null; role?: string };
  replies?: Reply[];
  likedByMe?: boolean;
}

export interface DiscussionRow {
  id: string;
  product_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface Reply {
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

export interface ReplyRow {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toDiscussion(row: DiscussionRow): Discussion {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    content: row.content,
    likesCount: row.likes_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toReply(row: ReplyRow): Reply {
  return {
    id: row.id,
    discussionId: row.discussion_id,
    userId: row.user_id,
    content: row.content,
    likesCount: row.likes_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

class DiscussionService {

  // List discussions for a product (with author + replies + liked state)
  async listForProduct(productId: string): Promise<Discussion[]> {
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
      logger.error("listForProduct error", error);
      throw new ApiError("Failed to fetch discussions", 500);
    }

    return (data as any[]).map((row) => {
      const d = toDiscussion(row);
      d.author = row.author
        ? { id: row.author.id, fullName: row.author.full_name, avatarUrl: row.author.avatar_url, role: row.author.role }
        : undefined;
      d.replies = (row.replies ?? []).map((r: any) => {
        const reply = toReply(r);
        reply.author = r.author
          ? { id: r.author.id, fullName: r.author.full_name, avatarUrl: r.author.avatar_url, role: r.author.role }
          : undefined;
        return reply;
      });
      return d;
    });
  }

  // Create a discussion
  async create(productId: string, userId: string, content: string): Promise<Discussion> {
    const { data, error } = await supabaseAdmin
      .from("product_discussions")
      .insert({ product_id: productId, user_id: userId, content })
      .select(`*, author:profiles!product_discussions_user_id_fkey(id, full_name, avatar_url, role)`)
      .single();

    if (error) {
      logger.error("create discussion error", error);
      throw new ApiError("Failed to create discussion", 500);
    }

    const d = toDiscussion(data as DiscussionRow);
    d.replies = [];
    d.author = (data as any).author
      ? { id: (data as any).author.id, fullName: (data as any).author.full_name, avatarUrl: (data as any).author.avatar_url, role: (data as any).author.role }
      : undefined;
    return d;
  }

  // Delete a discussion (owner only)
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

  // Toggle like on a discussion
  async toggleLike(discussionId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data: existing } = await supabaseAdmin
      .from("discussion_likes")
      .select("id")
      .eq("discussion_id", discussionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from("discussion_likes").delete().eq("id", existing.id);
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

  // Create a reply
  async createReply(discussionId: string, userId: string, content: string): Promise<Reply> {
    const { data, error } = await supabaseAdmin
      .from("discussion_replies")
      .insert({ discussion_id: discussionId, user_id: userId, content })
      .select(`*, author:profiles!discussion_replies_user_id_fkey(id, full_name, avatar_url, role)`)
      .single();

    if (error) {
      logger.error("createReply error", error);
      throw new ApiError("Failed to create reply", 500);
    }

    const r = toReply(data as ReplyRow);
    r.author = (data as any).author
      ? { id: (data as any).author.id, fullName: (data as any).author.full_name, avatarUrl: (data as any).author.avatar_url, role: (data as any).author.role }
      : undefined;

    // Notify discussion owner (fire-and-forget — must not block or throw)
    this.notifyProductDiscussionOwner(discussionId, userId, r.author?.fullName ?? "Someone").catch(() => {});

    return r;
  }

  private async notifyProductDiscussionOwner(
    discussionId: string,
    replierId: string,
    replierName: string
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

    await notificationService.create(
      owner,
      "discussion_reply",
      "New reply on your discussion",
      `${replierName} replied to: "${snippet}${ellipsis}"`,
      { discussionId, productId: (discussion as any).product_id, replierId }
    );
  }

  // Toggle like on a reply
  async toggleReplyLike(replyId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data: existing } = await supabaseAdmin
      .from("discussion_reply_likes")
      .select("id")
      .eq("reply_id", replyId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from("discussion_reply_likes").delete().eq("id", existing.id);
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

export const discussionService = new DiscussionService();
