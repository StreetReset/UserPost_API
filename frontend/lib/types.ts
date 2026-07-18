export type PostStatus = "draft" | "published" | "archived";

export interface PublicUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface PublicPost {
  id: number;
  author_id: number;
  author?: PublicUser;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Post extends PublicPost {
  status: PostStatus;
  is_active: boolean;
}

export interface User extends PublicUser {
  email: string;
  birth_date: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
}

export interface ApiError {
  detail?: string | Array<{ msg?: string }>;
}
