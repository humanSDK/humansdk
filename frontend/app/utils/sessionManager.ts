// utils/sessionManager.js

let sessionExpiredCallback: any = null;

export const setSessionExpiredCallback = (callback: any) => {
    sessionExpiredCallback = callback;
};

export const getSessionExpiredCallback = () => {
    return sessionExpiredCallback;
};
