import { apiClient } from "./client"
import { LoginRequest, RefreshTokenResponse, RegisterRequest, UserResponse } from "@/models/userAuth-interfaces"

export const authApi = {

    async register(data: RegisterRequest): Promise<UserResponse> {
        return apiClient.post<UserResponse>("/api/register", data)
    },

    async login(data: LoginRequest): Promise<UserResponse> {
        const loginResponse = await apiClient.post<UserResponse>("/api/login", data)

        if (loginResponse.token) {
            localStorage.setItem("accessToken", loginResponse.token);
        }

        if (loginResponse.refreshToken) {
            localStorage.setItem("refreshToken", loginResponse.refreshToken);
        }

        return loginResponse;
    },

    async refreshToken(): Promise<RefreshTokenResponse> {
        const refreshToken = localStorage.getItem("refreshToken");

        if(!refreshToken) {
            throw new Error("Refresh Token not available");
        }

        const refreshTokenResponse = await apiClient.post<RefreshTokenResponse>("/api/refresh-token", {refreshToken});

        if(refreshTokenResponse.token) {
            localStorage.setItem("accessToken", refreshTokenResponse.token);
        }

        if(refreshTokenResponse.refreshToken) {
            localStorage.setItem("refreshToken", refreshTokenResponse.refreshToken);
        }

        return refreshTokenResponse;
    },

    async logout(): Promise<void> {
        const getRefreshToken = localStorage.getItem("refreshToken");

        if(getRefreshToken) {
            try{
                apiClient.post("/api/users/logout", {getRefreshToken});
            }catch(err) {
                console.log("Logout Error", err);
            }
        }

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem("accessToken");
    },

    getAccessToken(): string | null {
        return localStorage.getItem("accessToken");
    },

    getRefreshToken(): string | null {
        return localStorage.getItem("accessToken")
    }
}