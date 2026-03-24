export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio: string;
  location: string;
  phone: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
  premium: boolean;
  premiumPlan: string;
  premiumStartedAt: string;
  premiumExpiresAt: string;
  quizCreationBlocked?: boolean;
  quizCreationBlockedAt?: string;
  quizCreationBlockReason?: string;
  stripeSubscriptionStatus?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name: string;
  email: string;
  image: string;
  bio: string;
  location: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuth: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
}
