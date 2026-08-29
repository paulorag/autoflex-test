import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("autoflex_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (localStorage.getItem("autoflex_token")) {
                localStorage.removeItem("autoflex_token");
                localStorage.removeItem("autoflex_user");
            }
            window.dispatchEvent(new Event("autoflex_unauthorized"));
            window.dispatchEvent(new Event("autoflex_auth_change"));
        }
        return Promise.reject(error);
    }
);

export default api;
