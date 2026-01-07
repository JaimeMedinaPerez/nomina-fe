export const API_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
    async get(endpoint: string) {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
        return response.json();
    }

    async getBlob(endpoint: string) {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
        return response.blob();
    }

    async post(endpoint: string, data: any) {
        const isFormData = data instanceof FormData;
        const options: RequestInit = {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),
        };

        if (!isFormData) {
            options.headers = { 'Content-Type': 'application/json' };
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = response.statusText;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.message) errorMessage = errorJson.message;
            } catch { }
            throw new Error(errorMessage);
        }
        return response.json();
    }

    async patch(endpoint: string, data: any) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`PATCH ${endpoint} failed: ${response.statusText}`);
        return response.json();
    }

    async delete(endpoint: string) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`DELETE ${endpoint} failed: ${response.statusText}`);
        return response.json();
    }
}

export const api = new ApiClient();
