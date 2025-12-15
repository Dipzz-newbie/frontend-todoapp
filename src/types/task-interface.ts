export interface TaskResponse {
    id: string;
    title: string;
    desc: string | null;
    completed: boolean;
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

export interface SearchTaskRequest {
    title?: string;
    createdAt?: string;
    updateAt?: string;
    page?: number;
    size?:number;
}

export interface SearchTaskResponse {
    data: TaskResponse[],
    paging: {
        current_page: number,
        total_page: number,
        size: number
    }
}

