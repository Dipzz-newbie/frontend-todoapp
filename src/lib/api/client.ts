import { env } from "process";

const API_BASE_URL = process.env.API_BASE_URL

interface ApiError {
    errors: string
}

interface ApiResponse<T> {
    data: T;
}

class ApiResponse<T> {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`
        }

        return headers
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
            if (contentType?.includes("application/json")) {
                const error: ApiError = await response.json();
                throw new Error(error.errors || "An Error occurred");
            }
            throw new Error(`HTTP Error: ${response.status}`);
        }

        if(contentType?.includes("application/json")) {
            const json: ApiResponse<T> = await response.json();
            return json.data
        }

        return {} as T;
    }
}