import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CommentThread } from "@/components/comment-thread";
import { LikeButton } from "@/components/like-button";
import { PostActions } from "./post-actions";
import { ReportButton } from "@/components/report-button";
import { getPostById } from "@/lib/db/posts";
import { getCommentsForPost } from "@/lib/db/comments";
import { getSessionUser } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, comments, viewer] = await Promise.all([
    getPostById(id),
    getCommentsForPost(id),
    getSessionUser(),
  ]);
  if (!post) notFound();

  const isMine = viewer?.id === post.user_id;

  return (
    <main className="flex-1">
      <div className="flex items-center justify-between px-5 py-3">
        <Link
          href="/today"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
        {isMine ? (
          <PostActions postId={post.id} />
        ) : viewer ? (
          <ReportButton postId={post.id} />
        ) : null}
      </div>

      <div className="bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image_url}
          alt={post.caption ?? `Post by @${post.author.username}`}
          className="w-full"
        />
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center justify-between">
          <Link
            href={`/u/${post.author.username}`}
            className="flex items-center gap-3"
          >
            <Avatar
              src={post.author.avatar_url}
              alt={post.author.display_name ?? post.author.username}
              size={40}
            />
            <div>
              <div className="text-sm font-semibold">
                {post.author.display_name ?? `@${post.author.username}`}
              </div>
              <div className="text-xs text-muted-foreground">
                @{post.author.username} · {relativeTime(post.created_at)}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <LikeButton
              postId={post.id}
              initialLiked={post.liked_by_me}
              initialCount={post.like_count}
            />
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {post.comment_count}
            </span>
          </div>
        </div>

        {post.caption && (
          <p className="whitespace-pre-wrap break-words text-sm">
            {post.caption}
          </p>
        )}

        <div className="border-t border-border pt-4">
          <CommentThread
            postId={post.id}
            comments={comments}
            canComment={!!viewer}
          />
        </div>
      </div>
    </main>
  );
}
