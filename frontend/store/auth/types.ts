import type { StoreApi } from "zustand";
import type {
    AuthResponse,
    AuthState,
    LoginDto,
    RegisterDto,
    UpdateProfileDto,
    User,
} from "../../types/auth.types";

export interface AuthStoreActions {
    setCurrentUser: (user: User) => void;
    login: (payload: LoginDto) => Promise<AuthResponse>;
    loginWithGoogle: (token: string) => Promise<AuthResponse>;
    register: (payload: RegisterDto) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    getMe: () => Promise<User | null>;
    updateProfile: (payload: UpdateProfileDto) => Promise<User>;
    setHasHydrated: (value: boolean) => void;
    syncTokenFromStorage: () => void;
}

export type AuthStore = AuthState & AuthStoreActions;

export type AuthStoreSet = StoreApi<AuthStore>["setState"];
export type AuthStoreGet = StoreApi<AuthStore>["getState"];
