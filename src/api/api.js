const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let onTokenRefreshed = null;
let onLogoutTriggered = null;

export const setTokenRefreshedCallback = (cb) => {
  onTokenRefreshed = cb;
};

export const setLogoutTriggeredCallback = (cb) => {
  onLogoutTriggered = cb;
};

const triggerGlobalLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  if (onLogoutTriggered) {
    onLogoutTriggered();
  }
};

const originalFetch = window.fetch;

const customFetch = async (url, options = {}) => {
  let res = await originalFetch(url, options);

  if (res.status === 401 && !url.includes('/auth/refresh') && !url.includes('/auth/login')) {
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshRes = await originalFetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();

          const isLocal = !!localStorage.getItem('refreshToken');
          if (isLocal) {
            localStorage.setItem('token', refreshData.token);
            localStorage.setItem('refreshToken', refreshData.refreshToken);
          } else {
            sessionStorage.setItem('token', refreshData.token);
            sessionStorage.setItem('refreshToken', refreshData.refreshToken);
          }

          if (onTokenRefreshed) {
            onTokenRefreshed(refreshData.token, refreshData.user);
          }

          const newHeaders = {
            ...options.headers,
            Authorization: `Bearer ${refreshData.token}`
          };

          res = await originalFetch(url, { ...options, headers: newHeaders });
        } else {
          triggerGlobalLogout();
        }
      } catch (err) {
        console.error('Failed to refresh token:', err);
        triggerGlobalLogout();
      }
    }
  }

  return res;
};

const fetch = customFetch;

// Helper to handle response and errors
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error en la petición');
  }
  return data;
};

// ─── Auth & Profile ──────────────────────────────────────────────────────────

export const registerUser = async (username, name, email, password) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, name, email, password }),
  });
  return handleResponse(res);
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const refreshSession = async (refreshToken) => {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return handleResponse(res);
};

export const logoutAllDevices = async (token) => {
  const res = await fetch(`${API_BASE}/auth/logout-all`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const logoutSession = async (refreshToken) => {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return handleResponse(res);
};

export const getMyProfile = async (token) => {
  const res = await fetch(`${API_BASE}/auth/profile/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getUserProfile = async (usernameOrId, token) => {
  const res = await fetch(`${API_BASE}/auth/profile/${usernameOrId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const updateProfile = async (usernameOrId, formData, token) => {
  // Nota: formData maneja automáticamente el Content-Type para multipart/form-data
  const res = await fetch(`${API_BASE}/auth/profile/${usernameOrId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
};

export const deleteProfileImage = async (usernameOrId, token) => {
  const res = await fetch(`${API_BASE}/auth/profile/${usernameOrId}/image`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const deleteUserProfile = async (userId, token, isSelf = true) => {
  const url = isSelf ? `${API_BASE}/auth/me` : `${API_BASE}/admin/users/${userId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const searchUsers = async (query, token = null) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/auth/users?search=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers,
  });
  return handleResponse(res);
};

// ─── Choirs ──────────────────────────────────────────────────────────────────

export const getChoirs = async (token = null) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/choirs`, { method: 'GET', headers });
  return handleResponse(res);
};

export const getChoirById = async (choirId, token = null) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/choirs/${choirId}`, { method: 'GET', headers });
  return handleResponse(res);
};

export const createChoir = async (formData, token) => {
  const res = await fetch(`${API_BASE}/choirs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
};

export const updateChoir = async (choirId, formData, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
};

export const deleteChoir = async (choirId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getMyChoirs = async (token) => {
  const res = await fetch(`${API_BASE}/auth/profile/me/choirs`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getExternalUserChoirs = async (usernameOrId, token) => {
  const res = await fetch(`${API_BASE}/auth/profile/${usernameOrId}/choirs`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

// ─── Choir Members & Requests ────────────────────────────────────────────────

export const joinChoir = async (choirId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getChoirMembers = async (choirId, token = null) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/choirs/${choirId}/members`, {
    method: 'GET',
    headers,
  });
  return handleResponse(res);
};

export const updateMemberRole = async (choirId, userId, role, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/members/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
};

export const removeChoirMember = async (choirId, userId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/members/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getChoirRequests = async (choirId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/requests`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const respondToJoinRequest = async (choirId, userId, status, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/requests/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }), // 'accepted' o 'rejected'
  });
  return handleResponse(res);
};

// ─── Choir Pieces ────────────────────────────────────────────────────────────

export const getChoirPieces = async (choirId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/pieces`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const createChoirPiece = async (choirId, formData, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/pieces`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
};

export const deleteChoirPiece = async (choirId, pieceId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/pieces/${pieceId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

// ─── Choir Events ────────────────────────────────────────────────────────────

export const getChoirEvents = async (choirId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/events`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

// Obtener eventos públicos de un coro (sin necesidad de autenticación)
export const getPublicChoirEvents = async (choirId) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/events/public`, {
    method: 'GET',
  });
  return handleResponse(res);
};

export const createChoirEvent = async (choirId, formData, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
};

export const deleteChoirEvent = async (choirId, eventId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getEventById = async (choirId, eventId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/events/${eventId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const updateChoirEvent = async (choirId, eventId, formData, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/events/${eventId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
};

export const getPieceById = async (choirId, pieceId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/pieces/${pieceId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const updateChoirPiece = async (choirId, pieceId, formData, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/pieces/${pieceId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
};

export const swapPieces = async (choirId, pieceId, targetPieceId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/pieces/${pieceId}/swap`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetPieceId }),
  });
  return handleResponse(res);
};

export const followChoir = async (choirId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/follow`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const unfollowChoir = async (choirId, token) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/follow`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getFollowedChoirs = async (token) => {
  const res = await fetch(`${API_BASE}/choirs/followed/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getChoirFollowers = async (choirId) => {
  const res = await fetch(`${API_BASE}/choirs/${choirId}/followers`, {
    method: 'GET',
  });
  return handleResponse(res);
};

export const getFollowedChoirsEvents = async (token) => {
  const res = await fetch(`${API_BASE}/events/followed`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getExternalUserFollowedChoirs = async (username, token) => {
  const res = await fetch(`${API_BASE}/auth/profile/${username}/followed-choirs`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const verifyEmailToken = async (token) => {
  const res = await fetch(`${API_BASE}/auth/verify-email?token=${token}`, {
    method: 'GET',
  });
  return handleResponse(res);
};