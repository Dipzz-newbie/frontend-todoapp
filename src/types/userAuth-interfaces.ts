export interface UserResponse {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    createdAt: string;
    updateAt: string;
    token?: string;
    refreshToken?: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UpdateUserRequest {
    email?: string;
    password?: string;
    name?: string;
}

export interface RefreshTokenResponse {
    token: string;
    refreshToken: string;
}