import { CreateTaskRequest, TaskResponse } from "@/models/tasks-interface";
import { apiClient } from "./client";


export const tasksApi = {
    async createTask(data: CreateTaskRequest): Promise<TaskResponse> {
        return apiClient.post<TaskResponse>("/api/users/tasks", data)
    },
    
    async getTask(): Promise<TaskResponse[]> {
        return apiClient.get<TaskResponse[]>("/api/users/tasks")
    }
}