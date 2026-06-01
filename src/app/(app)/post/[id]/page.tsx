import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CommentThread } from "@/components/comment-thread";
import { LikeButton } from "@/components/like-button";
import { PromptHero } from "@/components/prompt-hero";
import { PostActions } from "./post-actions";
import { ReportButton } from "@/components/report-button";
import { getPostById } from "@/lib/db/posts";
import { getCommentsForPost } from "@/lib/db/comments";
import { getTagsForPost } from "@/lib/db/tags";
import { getSessionUser } from "@/lib/supabase/server";
import { relativeTime, formatPromptDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function safeBackHref(from: string | undefined): string {
  if (from && from.startsWith("/") && !from.startsWith("//")) {
    return from;
  }
  return "/today";
}

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const [post, comments, viewer, tags] = await Promise.all([
    getPostById(id),
    getCommentsForPost(id),
    getSessionUser(),
    getTagsForPost(id),
  ]);
  if (!post) notFound();

  const isMine = viewer?.id === post.user_id;
  const backHref = safeBackHref(from);
  const promptDateLabel = post.prompt
    ? formatPromptDate(post.prompt.active_date, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <main className="flex-1">
      <div className="flex items-center justify-between px-5 py-3">
        <Link
          href={backHref}
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
            className="group flex items-center gap-3"
          >
            <Avatar
              src={post.author.avatar_url}
              alt={post.author.display_name ?? post.author.username}
              size={40}
            />
            <div>
              <div className="text-sm font-semibold group-hover:underline">
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

        {post.prompt && (
          <PromptHero
            text={post.prompt.text}
            date={promptDateLabel ?? undefined}
            eyebrow="Prompt on"
          />
        )}

        {post.caption && (
          <div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              Caption
            </div>
            <p className="whitespace-pre-wrap break-words text-sm">
              {post.caption}
            </p>
          </div>
        )}

        {tags.length > 0 && (
          <p className="text-xs text-muted-foreground">
            with{" "}
            {tags.map((tag, i) => (
              <span key={tag.id}>
                {i > 0 && ", "}
                <Link
                  href={`/u/${tag.tagged_user.username}`}
                  className="font-medium text-foreground hover:underline"
                >
                  @{tag.tagged_user.username}
                </Link>
              </span>
            ))}
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
