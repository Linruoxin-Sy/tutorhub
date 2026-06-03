import axios from 'axios';
import { getEnv } from './env';

export const request = axios.create({
  baseURL: getEnv('BASE_URL'),
  timeout: 5000,
});
