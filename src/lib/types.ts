export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

export type Prompt = {
  id: string;
  text: string;
  active_date: string;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  prompt_id: string;
  image_path: string;
  caption: string | null;
  created_at: string;
};

export type PostWithAuthor = Post & {
  author: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  image_url: string;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  author: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Profile>;
      };
      prompts: {
        Row: Prompt;
        Insert: Omit<Prompt, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Prompt>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Post>;
      };
      likes: {
        Row: { id: string; user_id: string; post_id: string; created_at: string };
        Insert: { user_id: string; post_id: string };
        Update: never;
      };
      comments: {
        Row: Omit<Comment, "author">;
        Insert: { post_id: string; user_id: string; body: string };
        Update: Partial<{ body: string }>;
      };
      prompt_pool: {
        Row: { id: string; text: string; used_on: string | null; created_at: string };
        Insert: { text: string; used_on?: string | null };
        Update: Partial<{ text: string; used_on: string | null }>;
      };
      reports: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: { post_id: string; user_id: string; reason?: string | null };
        Update: never;
      };
    };
  };
};
