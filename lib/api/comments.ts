const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const toggleCommentLike = async ({
  user_id,
  comment_id,
}: {
  user_id: string;
  comment_id: string;
}) => {
  const res = await fetch(
    `${API_BASE}/api/comment-like`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id,
        comment_id,
      }),
    }
  );

  return res.json();
};