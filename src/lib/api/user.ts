import { apiClient } from "./client";
import { UpdateUserRequest, UserResponse } from "@/types/userAuth-interfaces";

export const userApi = {
    async getCurrentUser(): Promise<UserResponse> {
        return apiClient.get<UserResponse>("/api/users/current");
    },

    async updateCurrentUser(data: UpdateUserRequest): Promise<UserResponse> {
        return apiClient.patch<UserResponse>("/api/users/current", data)
    },

    async uploadAvatar(formData: FormData): Promise<{ avatarUrl: string }> {
        return apiClient.post<{ avatarUrl: string }>(
            "/api/users/avatar",
            formData
        );
    },

    async removeAvatar(): Promise<{ message: string; avatarUrl: string }> {
        return apiClient.delete("/api/users/avatar");
    }

}