export type PostStatus = "draft" | "published" | "archived";

export interface PublicPost {
  id: number;
  author_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Post extends PublicPost {
  status: PostStatus;
  is_active: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  birth_date: string;
  first_name: string;
  last_name: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
}

export interface ApiError {
  detail?: string | Array<{ msg?: string }>;
}
