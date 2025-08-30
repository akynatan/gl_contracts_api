import { apiHubsoft } from '@/apis/hubsoft';

export function updateTokens() {
  apiHubsoft.authenticate();
}
