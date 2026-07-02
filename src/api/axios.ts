import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ro-897fe1b87ce043b3968caf53c5ef0699.ecs.ap-northeast-2.on.aws/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;