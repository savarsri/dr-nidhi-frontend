// setupInterceptors.js
import api from '../api';
import { clearUser } from './userSlice';

export const setupInterceptors = (store) => {
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  api.interceptors.request.use(
    (config) => {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        config.headers.Authorization = `JWT ${authToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const originalRequest = error.config;

      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = 'JWT ' + token;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          store.dispatch(clearUser());
          window.location.href = '/login';
          return Promise.reject(error);
        }

        return new Promise((resolve, reject) => {
          api
            .post('/auth/jwt/refresh', { refresh: refreshToken })
            .then(({ data }) => {
              const newAuthToken = data.access;
              localStorage.setItem('authToken', newAuthToken);
              api.defaults.headers.common.Authorization = 'JWT ' + newAuthToken;
              originalRequest.headers.Authorization = 'JWT ' + newAuthToken;
              processQueue(null, newAuthToken);
              resolve(api(originalRequest));
            })
            .catch((err) => {
              processQueue(err, null);
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              store.dispatch(clearUser());
              window.location.href = '/login';
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }

      return Promise.reject(error);
    }
  );
};
