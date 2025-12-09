
const API_BASE_URL = process.env.API_BASE_URL;

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

        if (contentType?.includes("application/json")) {
            const json: ApiResponse<T> = await response.json();
            return json.data
        }

        return {} as T;
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        let url = `${this.baseUrl}${endpoint}`;

        if (params) {
            const queryString = new URLSearchParams(
                Object.entries(params).reduce((acc, [key, value]) => {
                    if (value !== undefined && value !== null) {
                        acc[key] = String(value);
                    }return acc;
                }, {} as Record<string, string>)
            ).toString();

            if(queryString) {
                url += `?${queryString}`;
            }
        }

        const response = await fetch(url, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<T>(response);
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: data ? JSON.stringify(data): undefined
        });

        return this.handleResponse(response);
    }
}