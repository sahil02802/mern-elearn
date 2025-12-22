const TOKEN_KEY = "token";
const USER_KEY = "sessionUser";
const SESSION_EVENT = "session:changed";

const broadcastSessionChange = () => {
	if (typeof window === "undefined") return;
	try {
		window.dispatchEvent(new CustomEvent(SESSION_EVENT));
	} catch (err) {
		// ignore if CustomEvent is not available
	}
};

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setSession = ({ token, user }) => {
	if (token) {
		localStorage.setItem(TOKEN_KEY, token);
	}
	if (user) {
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	}
	broadcastSessionChange();
};

export const getCurrentUser = () => {
	const token = getToken();
	if (!token) return null;
	const raw = localStorage.getItem(USER_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch (err) {
		console.warn("Failed to parse session user", err);
		return null;
	}
};

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const clearSession = () => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
	broadcastSessionChange();
};

export const authHeader = () => {
	const token = getToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
};

export const updateStoredUser = (fields) => {
	const current = getCurrentUser() || {};
	const next = { ...current, ...fields };
	localStorage.setItem(USER_KEY, JSON.stringify(next));
	if (typeof window !== "undefined") {
		try {
			window.dispatchEvent(
				new CustomEvent("session:user-updated", { detail: next })
			);
		} catch (err) {
			// ignore if CustomEvent is not available
		}
	}
	return next;
};
