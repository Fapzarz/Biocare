export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  isAdmin: boolean;
  isDoctor: boolean;
  verified: boolean;
  password: string;
}

export interface Disease {
  name: string;
  type: 'physical' | 'mental';
  medication: string;
  therapy: string;
}

export interface Stats {
  totalAccess: number;
  diseasesAdded: number;
  diseasesDeleted: number;
  searchesPerformed: number;
  searchesSuccessful: number;
  searchesFailed: number;
  adminLogins: number;
  userAccess: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_type: 'user' | 'doctor';
  created_at: string;
  updated_at: string;
  category: string;
  status: 'open' | 'resolved';
  likes: number;
  is_private: boolean;
  tags: string[];
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_type: 'user' | 'doctor';
  content: string;
  created_at: string;
  updated_at: string;
  is_solution: boolean;
  likes: number;
}

export interface UserProfile extends User {
  bio?: string;
  specialization?: string;
  reputation: number;
  total_posts: number;
  total_solutions: number;
  badges: string[];
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  imageUrl: string;
  publishedAt: string;
  date: string;
  tags: string[];
}