// src/core/auth/sessionChannel.ts

export const sessionChannel = new BroadcastChannel('neps-auth-session');

export type SessionMessage = 'logout';

export const broadcastLogout = () => {
  sessionChannel.postMessage('logout');
};