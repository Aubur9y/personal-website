export interface Author {
  name: string;
  avatar: string;
  bio: string;
}

export interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  coverImage?: string;
  slug?: string;
  tags?: string[];
  readTime?: number;
  author?: Author;
  content?: {
    intro?: string;
    sections?: Array<{
      title: string;
      content: string;
    }>;
    conclusion?: string;
  };
} 