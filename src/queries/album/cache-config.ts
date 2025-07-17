const getMinutes = (minutes: number) => minutes * 60 * 1000
const getHours = (hours: number) => hours * 60 * 60 * 1000

export const CACHE_TIMES = {
    STATIC_DATA: getHours(24),
    SEMI_STATIC: getMinutes(30),
    DYNAMIC_DATA: getMinutes(5),
    REAL_TIME: getMinutes(1),
} as const

export const ALBUM_CACHE_POLICY = {
    MONTHLY: {
        staleTime: CACHE_TIMES.SEMI_STATIC,
        cacheTime: getHours(1),
    },
    DETAIL: {
        staleTime: CACHE_TIMES.STATIC_DATA,
        cacheTime: getHours(2),
    },
    SUMMARY: {
        staleTime: CACHE_TIMES.STATIC_DATA,
        cacheTime: getHours(2),
    },
    ACCESS: {
        staleTime: CACHE_TIMES.STATIC_DATA,
        cacheTime: getHours(2),
    },
    MEMBERS: {
        staleTime: CACHE_TIMES.SEMI_STATIC,
        cacheTime: getHours(1),
    },
    COMMENTS: {
        staleTime: CACHE_TIMES.DYNAMIC_DATA,
        cacheTime: getMinutes(30),
    },
    LIKES: {
        staleTime: CACHE_TIMES.DYNAMIC_DATA,
        cacheTime: getMinutes(30),
    },
} as const
