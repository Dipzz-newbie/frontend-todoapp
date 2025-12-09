// Ambil base URL dari environment variable
const API_BASE_URL = process.env.API_BASE_URL;

// Tipe error dari API (opsional properties)
interface ApiError {
    errors?: string;
    message?: string;
}

// Bentuk response API 
interface ApiResponse<T> {
    data: T;
}

class ApiClient {
    private baseUrl: string;

    // Lama timeout (10 detik)
    private timeoutMs = 10000;

    // Jumlah percobaan ulang kalau gagal
    private retries = 2;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Generate headers untuk setiap request
     * - Auto ambil token dari localStorage
     * - Set Content-Type JSON
     */
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem("token");

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        // Jika ada token, tambahkan Authorization
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Membungkus fetch dengan timeout menggunakan AbortController
     * Mencegah request menggantung terlalu lama
     */
    private async fetchWithTimeout(
        url: string,
        options: RequestInit
    ): Promise<Response> {
        const controller = new AbortController();

        // Timer untuk membatalkan request
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            return await fetch(url, {
                ...options,
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeout); // pastikan timer berhenti
        }
    }

    /**
     * Melakukan request dengan retry otomatis
     * Retry hanya untuk error jaringan seperti timeout
     */
    private async requestWithRetry(
        url: string,
        options: RequestInit
    ): Promise<Response> {
        for (let i = 0; i <= this.retries; i++) {
            try {
                return await this.fetchWithTimeout(url, options);
            } catch (err) {
                // Jika timeout
                if (err instanceof DOMException && err.name === "AbortError") {
                    console.warn("Request timeout");
                }

                // Jika sudah percobaan terakhir → lempar error
                if (i === this.retries) throw err;

                // Lanjut retry
            }
        }

        throw new Error("Unexpected request failure");
    }

    /**
     * Menangani response:
     * - Parse JSON
     * - Lempar error jika status bukan 2xx
     * - Return data normal jika success
     */
    private async handleResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get("content-type");

        // Jika response gagal
        if (!response.ok) {
            if (contentType?.includes("application/json")) {
                const errorJson: ApiError = await response.json();
                throw new Error(errorJson.errors || errorJson.message || "Request error");
            }

            throw new Error(`HTTP Error ${response.status}`);
        }

        // Jika sukses dan response JSON
        if (contentType?.includes("application/json")) {
            const json: ApiResponse<T> = await response.json();
            return json.data;
        }

        // Jika tidak ada data
        return {} as T;
    }

    /**
     * Membangun URL lengkap dengan query params
     */
    private buildUrl(endpoint: string, params?: Record<string, any>): string {
        let url = `${this.baseUrl}${endpoint}`;

        // Tambahkan query params jika ada
        if (params) {
            const query = new URLSearchParams(
                Object.fromEntries(
                    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
                )
            ).toString();

            if (query) url += `?${query}`;
        }

        return url;
    }

    /**
     * HTTP GET Request
     */
    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const url = this.buildUrl(endpoint, params);

        const response = await this.requestWithRetry(url, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<T>(response);
    }

    /**
     * HTTP POST Request
     */
    async post<T>(endpoint: string, data?: any): Promise<T> {
        const response = await this.requestWithRetry(`${this.baseUrl}${endpoint}`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse<T>(response);
    }

    /**
     * HTTP PATCH Request
     */
    async patch<T>(endpoint: string, data?: any): Promise<T> {
        const response = await this.requestWithRetry(`${this.baseUrl}${endpoint}`, {
            method: "PATCH",
            headers: this.getAuthHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse<T>(response);
    }

    /**
     * HTTP DELETE Request
     */
    async delete<T>(endpoint: string, data?: any): Promise<T> {
        const response = await this.requestWithRetry(`${this.baseUrl}${endpoint}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse<T>(response);
    }
}

// Export instance siap pakai
export const apiclient = new ApiClient(API_BASE_URL);
