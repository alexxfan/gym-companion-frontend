import API from './api';

export interface SessionSummary {
  session_id: number;
  workout_name: string;
  program_name: string;
  date: string;
}

export const getSessionHistory = async (): Promise<SessionSummary[]> => {
  const response = await API.get('/api/session/history');
  return response.data;
};
