import axios from 'axios';
import { CORE_SERVICE_API, USER_SERVICE_API } from '@/constant';
import { getSessionExpiredCallback } from './sessionManager';
const backends = {
    UserService: USER_SERVICE_API,
    CoreService: CORE_SERVICE_API,
};

const axiosInstances = {
    UserService: axios.create({ baseURL: backends.UserService }),
    CoreService: axios.create({ baseURL: backends.CoreService }),
};

// To manage session expiration globally
let sessionExpiredCallback: any = null;

Object.values(axiosInstances).forEach((instance) => {
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('ct_token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (error.response?.status === 401) {
                // Handle token refresh
                try {
                    const refreshResponse = await axios.get(`${backends.UserService}/auth/new-auth-token`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('rt_token')}` },
                    });
                    const newToken = refreshResponse.data.token;
                    localStorage.setItem('ct_token', newToken);

                    // Retry the original request
                    error.config.headers['Authorization'] = `Bearer ${newToken}`;
                    return instance(error.config);
                } catch (err) {
                    console.error('Token refresh failed:', err);
                    // Trigger session expired callback if refresh fails
                    const sessionExpiredCallback = getSessionExpiredCallback();
                    if (sessionExpiredCallback) {
                        sessionExpiredCallback(); // Call the global session expired handler
                    }
                }
            }
            return Promise.reject(error);
        }
    );
});

export default axiosInstances;
