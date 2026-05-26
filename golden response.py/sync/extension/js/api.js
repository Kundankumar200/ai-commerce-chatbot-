const BASE_API_URL = 'http://localhost:5000/api';
const ApiClient = {
    async request(endpoint, method = 'GET', payload = null) {
        const token = await StorageUtility.getLocalCache('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options = { method, headers };
        if (payload) options.body = JSON.stringify(payload);

        try {
            const response = await fetch(`${BASE_API_URL}${endpoint}`, options);
            return await response.json();
        } catch (err) {
            return { success: false, message: "Ecosystem server offline." };
        }
    }
};