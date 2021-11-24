import axios from 'axios';
import { reactLocalStorage } from 'reactjs-localstorage';

export const createFormData = body => {
  const data = new FormData();

  Object.keys(body).forEach(key => {
    if (key === 'trail_images') {
      body[key].map((image, index) =>
        Object.keys(image).forEach(k => {
          data.append(`trail_images[${index}][${k}]`, image[k]);
        }),
      );
    } else {
      data.append(key, body[key]);
    }
  });

  return data;
};

const instance = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no store, no cache, must revalidate, max age=0',
    Pragma: 'no-cache',
  },
  timeout: 180000,
});

instance.interceptors.request.use(config => {
  const token = reactLocalStorage.getObject('token').access_token;
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const handleError = ({ headers, message, data, status }) =>
  // eslint-disable-next-line prefer-promise-reject-errors
  Promise.reject({ headers, message, data, status });

instance.interceptors.response.use(
  response => response,
  ({ message, response: { headers, data, status } }) => {
    if (status === 401) {
      reactLocalStorage.remove('user');
      reactLocalStorage.remove('token');
      window.location.replace('/');
    }
    return handleError({ headers, message, data, status });
  },
);

export default instance;
