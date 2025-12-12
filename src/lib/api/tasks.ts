import { CreateTaskRequest, SearchTaskRequest, SearchTaskResponse, TaskResponse, UpdateTaskRequest } from "@/models/tasks-interface";
import { apiClient } from "./client";


export const tasksApi = {
    async createTask(data: CreateTaskRequest): Promise<TaskResponse> {
        return apiClient.post<TaskResponse>("/api/users/tasks", data)
    },
    
    async getTask(): Promise<TaskResponse[]> {
        return apiClient.get<TaskResponse[]>("/api/users/tasks")
    },

    async getTaskById(taskId: string): Promise<TaskResponse> {
        return apiClient.get<TaskResponse>(`/api/users/tasks/${taskId}`)
    },

    async updateTask(taskId: string, data: UpdateTaskRequest): Promise<TaskResponse> {
        return apiClient.patch<TaskResponse>(`/api/users/tasks/${taskId}`, data)
    },

    async deleteTask(taskId: string): Promise<{message: string}> {
        return apiClient.delete<{message: string}>(`/api/users/tasks/${taskId}`)
    },

    async searchTasks(params: SearchTaskRequest): Promise<SearchTaskResponse> {
        return apiClient.get<SearchTaskResponse>("/api/users/tasks/search", params)
    }
}