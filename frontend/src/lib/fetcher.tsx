import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

// Create Axios instance
const fetcher = axios.create({
	baseURL:
		import.meta.env.VITE_API_BASE_URL ||
		"https://dog.ceo/api/breeds/image/random",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request middleware
fetcher.interceptors.request.use(
	(config) => {
		// Example: Add auth token if available
		const token = localStorage.getItem("token");
		
        if (token) {
			// config.headers = {
			// 	...(config.headers ?? {}),
			// 	Authorization: `Bearer ${token}`,
			// };
		}

		return config;
	},
	(error) => Promise.reject(error)
);

// Response middleware
fetcher.interceptors.response.use(
	(response: AxiosResponse) => response,
	(error) => {
		// Example: Handle global errors
		if (error.response && error.response.status === 401) {
			// Handle unauthorized
			// e.g., redirect to login
		}
		return Promise.reject(error);
	}
);

export default fetcher;
