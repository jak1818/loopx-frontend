"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Heart, ImagePlus } from "lucide-react";
import { toggleCommentLike } from "@/lib/api/comments";
import { useAppData } from "@/providers/AppDataProvider";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface Comment {
  id: string;
  content: string;
  created_at: string;

  likes_count: number;
  liked_by_me: boolean;
  image_url?: string | null;
  parent_comment_id?: string | null;

  user_id: string;
  username: string;
  avatar_url: string;
}

export default function CommentSheet({
  video_id,
  user_id,
  creator_id,
  onClose,
  onCommentCountChange, 
}: {
  video_id: string;
  user_id: string;
  creator_id: string;
  onClose: () => void;
  onCommentCountChange?: (delta: number) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [touchStartY, setTouchStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const { webUser, telegramUser } = useAppData();
const fetchComments = async () => {

  if (!video_id || !user_id) return;

  const res = await fetch(
    `${BACKEND}/api/comments?video_id=${video_id}&user_id=${user_id}`
  );

  const data = await res.json();

  if (data.success) {
    setComments(data.data);
  }
};
  

useEffect(() => {
  window.dispatchEvent(new Event("comments-open"));

  requestAnimationFrame(() => {
    setVisible(true);
  });

  return () => {
    window.dispatchEvent(new Event("comments-close"));
  };
}, []);

useEffect(() => {
  if (video_id && user_id) {
    fetchComments();
  }
}, [video_id, user_id]);

const handleSend = async () => {
  if (!text.trim() && !selectedImage) return;

  setLoading(true);

  let imageUrl = null;

  // 1️⃣ upload image first
  if (selectedImage) {
    const formData = new FormData();

    formData.append("image", selectedImage);

    const uploadRes = await fetch(
      `${BACKEND}/api/upload/comment-image`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadData = await uploadRes.json();

    if (uploadData.success) {
      imageUrl = uploadData.url;
    }
  }

  // 2️⃣ create comment
  const res = await fetch(`${BACKEND}/api/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      user_id,
      video_id,
      content: text.trim(),
      image_url: imageUrl,
	  parent_comment_id:replyingTo?.id || null,
    }),
  });

  const data = await res.json();

  if (data.success) {
    onCommentCountChange?.(1);

    setText("");

    setSelectedImage(null);
	
	setReplyingTo(null);

    fetchComments();
  }

  setLoading(false);
};

const handleDelete = async (comment_id: string) => {
  const res = await fetch(`${BACKEND}/api/comment`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, comment_id }),
  });
  const data = await res.json();
  if (data.success) {
    onCommentCountChange?.(-1);  // ⭐ 新增：通知父组件评论-1
    fetchComments();
  }
};

const handleLike = async (comment_id: string) => {
  const data = await toggleCommentLike({
    user_id,
    comment_id,
  });

  if (data.success) {
    setComments(prev =>
      prev.map(c =>
        c.id === comment_id
          ? {
              ...c,
              liked_by_me: data.liked,
              likes_count: data.likes_count,
            }
          : c
      )
    );
  }
};

const handleTouchStart = (
  e: React.TouchEvent
) => {
  setTouchStartY(e.touches[0].clientY);
};

const handleTouchMove = (
  e: React.TouchEvent
) => {
  // 🔥 comments 还没 scroll 到顶部
  // 不允许拖整个 sheet
  if (
    scrollRef.current &&
    scrollRef.current.scrollTop > 0
  ) {
    return;
  }

  const currentY = e.touches[0].clientY;

  const diff = currentY - touchStartY;

 // 🔥 resistance effect
const resisted =
  diff > 0
    ? diff * 0.35
    : 0;

// 只允许向下拖
if (diff > 0) {
  setTranslateY(resisted);
}
};

const handleTouchEnd = () => {
  if (translateY > 70) {
    handleClose();
  } else {
    setTranslateY(0);
  }
};

const formatTimeAgo = (
  dateString: string
) => {
  const now = new Date();

  const date = new Date(dateString);

  const seconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 4) {
    return `${weeks}w`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months}mo`;
  }

  const years = Math.floor(days / 365);

  return `${years}y`;
};

const handleClose = () => {
  setClosing(true);

  setTimeout(() => {
    onClose();
  }, 220);
};

  return (
  <>
  <div
  className={`fixed inset-0 z-[9999] flex items-end transition-colors duration-200 backdrop-blur-[2px] ${visible ? "bg-black/40" : "bg-black/0"}`}
>
    
    <div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
 style={{
  transform: closing
    ? "translateY(100%)"
    : visible
    ? `translateY(${translateY}px)`
    : "translateY(100%)",

  transition:
    translateY === 0
      ? "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none",
}}
  className="w-full max-w-md mx-auto bg-gray-900 h-[75vh] rounded-t-2xl flex flex-col pb-6"
>
      
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <h2 className="text-white font-bold">{comments.length} comments</h2>

        <button onClick={handleClose} className="text-white">
          <X />
        </button>
      </div>

      <div
  ref={scrollRef}
  className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
>
        {comments
  .filter(c => !c.parent_comment_id)
  .map((c) => (
          <div
  key={c.id}
  onContextMenu={(e) => {
    e.preventDefault();

    if (c.user_id === user_id) {
      setSelectedComment(c);
    }
  }}
  className={`flex items-start gap-3 ${
  c.parent_comment_id ? "ml-10" : ""
}`}
>

         {c.avatar_url ? (
  <img
    src={c.avatar_url}
    className="w-8 h-8 rounded-full"
  />
) : (
  <div className="w-8 h-8 rounded-full bg-gray-600" />
)}

<div className="flex flex-1 justify-between gap-3">

  <div className="flex-1 min-w-0">

    <div className="flex items-center gap-2">
      <p className="text-sm font-semibold text-white">
        {c.username}
      </p>
	  
	  {c.user_id === creator_id && (
    <span className="text-[10px] px-2 py-[2px] rounded-full bg-blue-500/20 text-blue-400">
      Creator
    </span>
  )}

      <span className="text-xs text-gray-500">
        {formatTimeAgo(c.created_at)}
      </span>
    </div>

    {c.content && (
      <p className="text-sm text-white mt-1 whitespace-pre-wrap break-words">
        {c.content}
      </p>
    )}
	
	<div className="flex items-center gap-3 mt-2">
{!c.parent_comment_id && (
  <button
onClick={() => {
  setReplyingTo(c);
  setText(prev =>
  prev + `@${c.username} `
);

  setTimeout(() => {
    inputRef.current?.focus();
  }, 50);
}}
    className="text-xs text-gray-500 mt-2"
  >
    Reply
  </button>
)}

{comments.filter(
  reply =>
    reply.parent_comment_id === c.id
).length > 0 && (

  <button
    onClick={() =>
      setExpandedReplies(prev => ({
        ...prev,
        [c.id]: !prev[c.id],
      }))
    }
    className="text-xs text-gray-500 mt-2"
  >
    {expandedReplies[c.id]
      ? "Hide replies"
      : `View replies (${
          comments.filter(
            reply =>
              reply.parent_comment_id === c.id
          ).length
        })`}
  </button>
)}
</div>

    {c.image_url && (
      <img
        src={c.image_url}
        alt="comment"
        className="mt-2 rounded-2xl max-h-72 max-w-full object-cover border border-gray-700"
      />
    )}

  </div>

  <div className="flex flex-col items-center pt-1 shrink-0">
    <button
      onClick={() => handleLike(c.id)}
      className="flex flex-col items-center"
    >
      <Heart
        className={`w-5 h-5 transition-transform duration-200 ${
          c.liked_by_me
            ? "fill-red-500 text-red-500 scale-125"
            : "text-gray-400 scale-100"
        }`}
      />

      <span className="text-[11px] text-gray-400">
        {c.likes_count ?? 0}
      </span>
    </button>
  </div>
  
</div>

{expandedReplies[c.id] && 
 comments
  .filter(
    reply =>
      reply.parent_comment_id === c.id
  )
  .map(reply => (
  <div
  key={reply.id}
  className="flex items-start gap-3 ml-10 mt-3 animate-in fade-in slide-in-from-top-1 duration-200"
  onContextMenu={(e) => {
    e.preventDefault();

    if (reply.user_id === user_id) {
      setSelectedComment(reply);
    }
  }}
>

      {reply.avatar_url ? (
        <img
          src={reply.avatar_url}
          className="w-7 h-7 rounded-full"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gray-600" />
      )}

      <div className="flex flex-1 justify-between gap-3">

        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">
              {reply.username}
            </p>
			
			{reply.user_id === creator_id && (
    <span className="text-[10px] px-2 py-[2px] rounded-full bg-blue-500/20 text-blue-400">
      Creator
    </span>
  )}

            <span className="text-xs text-gray-500">
              {formatTimeAgo(reply.created_at)}
            </span>
          </div>

          {reply.content && (
            <p className="text-sm text-white mt-1 whitespace-pre-wrap break-words">
              {reply.content}
            </p>
          )}
		  
		  {reply.image_url && (
  <img
    src={reply.image_url}
    alt="reply"
    className="mt-2 rounded-2xl max-h-72 max-w-full object-cover border border-gray-700"
  />
)}

        </div>

        <div className="flex flex-col items-center pt-1 shrink-0">
          <button
            onClick={() =>
              handleLike(reply.id)
            }
            className="flex flex-col items-center"
          >
            <Heart
               className={`w-5 h-5 transition-transform duration-200 ${
                reply.liked_by_me
                  ? "fill-red-500 text-red-500 scale-125"
                  : "text-gray-400 scale-100"
              }`}
            />

            <span className="text-[11px] text-gray-400">
              {reply.likes_count ?? 0}
            </span>
          </button>
        </div>

      </div>

    </div>
))}

          </div>
        ))}
      </div>

{selectedImage && (
  <div className="px-4 pb-2">
    <img
      src={URL.createObjectURL(selectedImage)}
      className="w-24 h-24 object-cover rounded-lg"
    />
  </div>
)}

{replyingTo && (
  <div className="px-4 pb-2 text-xs text-gray-400">
    Replying to @{replyingTo.username}

    <button
      onClick={() => {
  setReplyingTo(null);

  setText("");
}}
      className="ml-2 text-red-400"
    >
      Cancel
    </button>
  </div>
)}

{showEmojiPicker && (
  <div className="absolute bottom-28 left-2 z-[10000]">
    <Picker
      data={data}
      theme="dark"
      onEmojiSelect={(emoji: any) => {
        setText(prev => prev + emoji.native);
		setShowEmojiPicker(false);
      }}
    />
  </div>
)}

      <div className="p-4 border-t border-gray-800 flex items-center gap-3 shrink-0 bg-gray-900">
        
		{(telegramUser?.photo_url || webUser?.avatar_url) ? (
  <img
    src={
      telegramUser?.photo_url ||
      webUser?.avatar_url
    }
    className="w-8 h-8 rounded-full"
  />
) : (
  <div className="w-8 h-8 rounded-full bg-gray-600" />
)}

<label className="cursor-pointer text-gray-400">
  <ImagePlus className="w-5 h-5" />

  <input
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (!file) return;

      // max 2MB
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be below 2MB");
        return;
      }

      setSelectedImage(file);
    }}
  />
</label>

<button
  onClick={() =>
    setShowEmojiPicker(prev => !prev)
  }
  className="text-xl"
>
  😊
</button>

        <input
		  ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add comment..."
          className={`flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm outline-none transition-all ${
  replyingTo
    ? "ring-1 ring-blue-500"
    : ""
}`}
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="text-blue-400 p-1"
        >
          <Send size={20} />
        </button>

      </div>

    </div>

  </div>


{selectedComment && (
  <div className="fixed inset-0 z-[10001] bg-black/50 flex items-end">
    <div className="w-full bg-gray-900 rounded-t-3xl p-4">

      <button
        onClick={() => {
          handleDelete(selectedComment.id);
          setSelectedComment(null);
        }}
        className="w-full text-left text-red-500 py-4 border-b border-gray-800"
      >
        Delete
      </button>

      <button
        onClick={() => {
          navigator.clipboard.writeText(
            selectedComment.content
          );

          setSelectedComment(null);
        }}
        className="w-full text-left text-white py-4 border-b border-gray-800"
      >
        Copy
      </button>

      <button
        onClick={() => setSelectedComment(null)}
        className="w-full text-center text-gray-400 py-4"
      >
        Cancel
      </button>

    </div>
  </div>
)}

</>
);
}