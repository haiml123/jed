const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jed_token') : null;
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: { email: string; password: string; name: string; role?: string }) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    profile: () => fetchApi('/auth/profile'),
  },
  lessons: {
    list: () => fetchApi('/lessons'),
    get: (id: string) => fetchApi(`/lessons/${id}`),
    assigned: () => fetchApi('/lessons/assigned'),
    create: (data: any) => fetchApi('/lessons', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchApi(`/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi(`/lessons/${id}`, { method: 'DELETE' }),
    createUnit: (data: any) => fetchApi('/lessons/units', { method: 'POST', body: JSON.stringify(data) }),
    createQuestion: (data: any) => fetchApi('/lessons/quiz-questions', { method: 'POST', body: JSON.stringify(data) }),
    generateQuiz: (data: { lessonTitle: string; topic: string; description?: string; numQuestions: number }) =>
      fetchApi('/lessons/quiz/generate', { method: 'POST', body: JSON.stringify(data) }),
  },
  progress: {
    list: () => fetchApi('/progress'),
    xp: () => fetchApi('/progress/xp'),
    weeklyEngagement: () => fetchApi('/progress/weekly-engagement'),
    updateVideo: (unitId: string, watchPercent: number) => fetchApi('/progress/video', { method: 'POST', body: JSON.stringify({ unitId, watchPercent }) }),
    submitExitTicket: (unitId: string, response: string, shareWithDirector?: boolean) => fetchApi('/progress/exit-ticket', { method: 'POST', body: JSON.stringify({ unitId, response, shareWithDirector }) }),
    submitQuiz: (unitId: string, answers: { questionId: string; optionId: string }[]) => fetchApi('/progress/quiz', { method: 'POST', body: JSON.stringify({ unitId, answers }) }),
    submitReflection: (unitId: string, content: string, sharedWithDirector?: boolean) => fetchApi('/progress/reflection', { method: 'POST', body: JSON.stringify({ unitId, content, sharedWithDirector }) }),
  },
  users: {
    list: (role?: string) => fetchApi(`/users${role ? `?role=${role}` : ''}`),
    get: (id: string) => fetchApi(`/users/${id}`),
    progress: (id: string) => fetchApi(`/users/${id}/progress`),
    create: (data: { name: string; email: string; school?: string; role?: string; password?: string }) =>
      fetchApi('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchApi(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi(`/users/${id}`, { method: 'DELETE' }),
  },
  groups: {
    list: () => fetchApi('/groups'),
    get: (id: string) => fetchApi(`/groups/${id}`),
    create: (data: { name: string; description?: string }) => fetchApi('/groups', { method: 'POST', body: JSON.stringify(data) }),
    addMember: (groupId: string, userId: string) => fetchApi(`/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ userId }) }),
    removeMember: (groupId: string, userId: string) => fetchApi(`/groups/${groupId}/members/${userId}`, { method: 'DELETE' }),
    assign: (data: { lessonId: string; groupId?: string; userId?: string; dueDate?: string }) => fetchApi('/groups/assign', { method: 'POST', body: JSON.stringify(data) }),
    assignments: () => fetchApi('/groups/assignments/list'),
  },
  analytics: {
    overview: () => fetchApi('/analytics/overview'),
    reflections: () => fetchApi('/analytics/reflections'),
    teachers: () => fetchApi('/analytics/teachers'),
  },
};
