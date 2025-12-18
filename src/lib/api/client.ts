// Ambil base URL dari environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL as string;

if (!API_BASE_URL) {
    throw new Error("VITE_API_URL belum diset di file .env");
}

// Tipe error dari API (opsional properties)
interface ApiError {
    errors?: string;
    message?: string;
}

interface ApiResponse<T> {
    data: T;
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getAuthHeaders(json: boolean = true): HeadersInit {
        const token = localStorage.getItem("accessToken");
        const headers: HeadersInit = {};

        if (json) {
            headers["Content-Type"] = "application/json";
        }

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        return headers;
    }


    private async handleResponse<T>(response: Response, retryRequest?: () => Promise<Response>): Promise<T> {
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
            // Handle 401 Unauthorized - Try to refresh token
            if (response.status === 401 && retryRequest) {
                try {
                    const refreshToken = localStorage.getItem("refreshToken");
                    if (refreshToken) {
                        // Try to refresh the token
                        const refreshResponse = await fetch(`${this.baseURL}/api/refresh-token`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ refreshToken }),
                        });

                        if (refreshResponse.ok) {
                            const refreshData = await refreshResponse.json();
                            localStorage.setItem("accessToken", refreshData.data.token);
                            localStorage.setItem("refreshToken", refreshData.data.refreshToken);

                            // Retry the original request with new token
                            const retryResponse = await retryRequest();
                            return this.handleResponse<T>(retryResponse);
                        }
                    }
                } catch (error) {
                    // Refresh failed, clear tokens and redirect to login
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    window.location.hash = "/login";
                }
            }

            if (contentType?.includes("application/json")) {
                const error: ApiError = await response.json();
                throw new Error(error.errors || "An error occurred");
            }
            throw new Error(`HTTP Error: ${response.status}`);
        }

        if (contentType?.includes("application/json")) {
            const json: ApiResponse<T> = await response.json();
            return json.data;
        }

        return {} as T;
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        let url = `${this.baseURL}${endpoint}`;

        if (params) {
            const queryString = new URLSearchParams(
                Object.entries(params).reduce((acc, [key, value]) => {
                    if (value !== undefined && value !== null) {
                        acc[key] = String(value);
                    }
                    return acc;
                }, {} as Record<string, string>)
            ).toString();

            if (queryString) {
                url += `?${queryString}`;
            }
        }

        const makeRequest = () => fetch(url, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        const response = await makeRequest();
        return this.handleResponse<T>(response, makeRequest);
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        const isFormData = data instanceof FormData;

        const makeRequest = () =>
            fetch(`${this.baseURL}${endpoint}`, {
                method: "POST",
                headers: this.getAuthHeaders(!isFormData),
                body: data
                    ? isFormData
                        ? data
                        : JSON.stringify(data)
                    : undefined,
            });

        const response = await makeRequest();
        return this.handleResponse<T>(response, makeRequest);
    }


    async patch<T>(endpoint: string, data?: any): Promise<T> {
        const isFormData = data instanceof FormData;

        const makeRequest = () =>
            fetch(`${this.baseURL}${endpoint}`, {
                method: "PATCH",
                headers: this.getAuthHeaders(!isFormData),
                body: data
                    ? isFormData
                        ? data
                        : JSON.stringify(data)
                    : undefined,
            });

        const response = await makeRequest();
        return this.handleResponse<T>(response, makeRequest);
    }


    async delete<T>(endpoint: string): Promise<T> {
        const makeRequest = () => fetch(`${this.baseURL}${endpoint}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        });

        const response = await makeRequest();
        return this.handleResponse<T>(response, makeRequest);
    }
}

// Export instance siap pakai
export const apiClient = new ApiClient(API_BASE_URL);
