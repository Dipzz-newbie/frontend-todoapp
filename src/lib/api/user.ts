import { apiClient } from "./client";
import { UpdateUserRequest, UserResponse } from "@/types/userAuth-interfaces";

export const userApi = {
    async getCurrentUser(): Promise<UserResponse> {
        return apiClient.get<UserResponse>("/api/users/current");
    },

    async updateCurrentUser(data: UpdateUserRequest): Promise<UserResponse> {
        return apiClient.patch<UserResponse>("/api/user/current", data)
    }
}