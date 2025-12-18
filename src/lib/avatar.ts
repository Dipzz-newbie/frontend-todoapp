const API_BASE_URL = import.meta.env.VITE_API_URL as string;

export const getAvatarUrl = (avatarUrl?: string | null) => {
    if (!avatarUrl) return;
    return `${API_BASE_URL}${avatarUrl}`;
};
