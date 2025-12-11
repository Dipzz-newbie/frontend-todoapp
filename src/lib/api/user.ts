import { apiClient } from "./client";
import { UpdateUserRequest, UserResponse } from "@/models/auth-interfaces";

export const userAPi = {
    async getCurrentUser(): Promise<UserResponse> {
        return apiClient.get<UserResponse>("/api/users/current");
    },

    async updateCurrentUser(data: UpdateUserRequest): Promise<UserResponse> {
        return apiClient.patch<UserResponse>("/api/user/current", data)
    }
}