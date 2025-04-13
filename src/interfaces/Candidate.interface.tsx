export interface Candidate {
  id: number;
  name: string | null;    // Full name (can be null if not set)
  login: string;         // GitHub username
  location: string | null;
  avatar_url: string;    // Profile image URL
  email: string | null;  // Can be null if not public
  html_url: string;      // GitHub profile URL
  company: string | null;
  bio: string | null;    // GitHub bio
  public_repos?: number;
  followers?: number;
  following?: number;
  created_at?: string;
  updated_at?: string;
  // GitHub API special response properties
  notFound?: boolean;
  error?: boolean;
  message?: string;
}
