"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/app/actions/follows";

export function FollowButton({
  targetUserId,
  initialFollowing,
}: {
  targetUserId: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = React.useState(initialFollowing);
  const [pending, startTransition] = React.useTransition();

  function onClick() {
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      const result = await toggleFollow(targetUserId);
      if (!result.ok) {
        setFollowing(!next);
        toast.error(result.error);
      } else {
        setFollowing(result.following);
      }
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={following ? "secondary" : "default"}
      onClick={onClick}
      disabled={pending}
      aria-pressed={following}
    >
      {following ? "Unfollow" : "Follow"}
    </Button>
  );
}
