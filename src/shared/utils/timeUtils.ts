export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전` // 30일
    return formatAbsoluteDate(date) // 30일 이후는 절대 날짜
}

export const formatAbsoluteDate = (date: Date): string => {
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export const formatAbsoluteDateTime = (date: Date): string => {
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// 기존 함수명 유지 (하위 호환성)
export const formatTime = formatRelativeTime

// 추가 유틸리티들
export const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
}

export const isYesterday = (date: Date): boolean => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return date.toDateString() === yesterday.toDateString()
}

export const getTimeConstants = () => ({
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
})

export const formatDateTime = (dateTime: any) => {
    if (!dateTime) return null
    try {
        const date = new Date(dateTime)
        return {
            date: date.toLocaleDateString('ko-KR'),
            time: date.toLocaleTimeString('ko-KR'),
            iso: date.toISOString(),
        }
    } catch {
        return { raw: dateTime }
    }
}
