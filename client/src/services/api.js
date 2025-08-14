import axios from 'axios';

 const api = axios.create({
  baseURL: 'https://imagineaii.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;