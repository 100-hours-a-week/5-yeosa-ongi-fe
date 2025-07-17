export const ALBUM_KEYS = {
    all: ['album'] as const,
    MONTHLY: (yearMonth?: string) => [...ALBUM_KEYS.all, 'monthly', yearMonth] as const,
    DETAIL: (albumId: string) => [...ALBUM_KEYS.all, 'detail', albumId] as const,
    SUMMARY: (albumId: string) => [...ALBUM_KEYS.all, 'summary', albumId] as const,
    ACCESS: (albumId: string) => [...ALBUM_KEYS.all, 'access', albumId] as const,
    MEMBERS: (albumId: string) => [...ALBUM_KEYS.all, 'members', albumId] as const,
    COMMENTS: (albumId: string) => [...ALBUM_KEYS.all, 'comments', albumId] as const,
    LIKES: (albumId: string) => [...ALBUM_KEYS.all, 'likes', albumId] as const,
    PICTURES: (albumId: string) => [...ALBUM_KEYS.all, 'pictures', albumId] as const,
} as const
