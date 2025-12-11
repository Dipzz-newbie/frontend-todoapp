export interface TaskResponse {
    id: string;
    title: string;
    desc: string | null;
    complatedAt: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskRequest {
    title: string;
    desc?: string;
}

export interface UpdateTaskRequest {
    title?: string;
    desc?:string;
}



