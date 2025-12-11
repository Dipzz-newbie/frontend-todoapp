import { apiClient } from "./client"
import { LoginRequest, RegisterRequest, UserResponse } from "../../models/auth-interfaces"

export const authApi = {

    async register(data: RegisterRequest): Promise<UserResponse> {
        return apiClient.post<UserResponse>("/api/register", data)
    }

    async login(data: LoginRequest): Promise<UserResponse> {
        const loginResponse = await apiClient.post<UserResponse>("/api/login", data)

        if (loginResponse.token) {
            localStorage.setItem("accessToken", loginResponse.token);
        }

        if (loginResponse.refreshToken) {
            localStorage.setItem("refreshToken", loginResponse.refreshToken);
        }

        return loginResponse;
    }
}