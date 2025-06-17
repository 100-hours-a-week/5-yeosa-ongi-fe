import ToastContainer from '@/components/common/Toast/ToastContainer'
import { Toast, ToastContextValue, ToastProviderProps } from '@/types/toast.type'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider = ({ children, defaultDuration = 3000, maxToasts = 5 }: ToastProviderProps) => {
    // States
    const [toasts, setToasts] = useState<Toast[]>([])
    const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
    /**
     * 새로운 토스트 추가 함수
     * @param toastData
     * @returns
     */
    const addToast = useCallback(
        (toastData: Omit<Toast, 'id' | 'createdAt'>): string => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
            const duration = toastData.duration ?? defaultDuration

            const newToast: Toast = {
                ...toastData,
                id,
                createdAt: Date.now(),
                duration,
            }

            console.log('[ToastProvider] 토스트 추가:', {
                id,
                type: newToast.type,
                message: newToast.message,
                duration,
            })

            // ✅ 최대 토스트 수 제한 로직 추가
            setToasts(prevToasts => {
                const updatedToasts = [newToast, ...prevToasts]

                // 최대 개수 초과 시 오래된 것부터 제거
                if (updatedToasts.length > maxToasts) {
                    const toastsToRemove = updatedToasts.slice(maxToasts)

                    // 제거되는 토스트들의 타이머도 정리
                    toastsToRemove.forEach(toast => {
                        const timer = timersRef.current.get(toast.id)
                        if (timer) {
                            clearTimeout(timer)
                            timersRef.current.delete(toast.id)
                        }
                    })

                    console.log('[ToastProvider] 최대 개수 초과로 제거:', toastsToRemove.length, '개')
                    return updatedToasts.slice(0, maxToasts)
                }

                return updatedToasts
            })

            if (duration > 0) {
                const timer = setTimeout(() => {
                    console.log('[ToastProvider] 자동 제거:', id)
                    removeToast(id)
                }, duration)

                // 타이머 저장 (나중에 수동 제거 시 정리하기 위함)
                timersRef.current.set(id, timer)
            }

            return id
        },
        [defaultDuration, maxToasts]
    )

    /**
     * 토스트 제거 함수
     * @param id
     */
    const removeToast = useCallback((id: string): void => {
        console.log('[ToastProvider] 토스트 제거 요청:', id)

        const timer = timersRef.current.get(id)
        if (timer) {
            clearTimeout(timer)
            timersRef.current.delete(id)
            console.log('[ToastProvider] 타이머 정리:', id)
        }

        // 상태에서 제거
        setToasts(prevToasts => {
            const filteredToasts = prevToasts.filter(toast => toast.id !== id)
            console.log('[ToastProvider] 토스트 제거 완료, 남은 개수:', filteredToasts.length)
            return filteredToasts
        })
    }, [])

    /**
     * 모든 토스트 제거 함수
     */
    const clearAllToasts = useCallback((): void => {
        console.log('[ToastProvider] 모든 토스트 제거')

        timersRef.current.forEach((timer, id) => {
            clearTimeout(timer)
            console.log('[ToastProvider] 타이머 정리:', id)
        })
        timersRef.current.clear()

        // 모든 토스트 제거
        setToasts([])
    }, [])

    /**
     * 성공 토스트 표시
     */
    const success = useCallback(
        (message: string, options?: Partial<Toast>): string => {
            return addToast({
                type: 'success',
                message,
                ...options,
            })
        },
        [addToast]
    )

    /**
     * 에러 토스트 표시 (기본적으로 더 오래 표시)
     */
    const error = useCallback(
        (message: string, options?: Partial<Toast>): string => {
            return addToast({
                type: 'error',
                message,
                duration: options?.duration ?? 8000, // 에러는 기본 8초
                ...options,
            })
        },
        [addToast]
    )

    /**
     * 경고 토스트 표시
     */
    const warning = useCallback(
        (message: string, options?: Partial<Toast>): string => {
            return addToast({
                type: 'warning',
                message,
                ...options,
            })
        },
        [addToast]
    )

    /**
     * 정보 토스트 표시
     */
    const info = useCallback(
        (message: string, options?: Partial<Toast>): string => {
            return addToast({
                type: 'info',
                message,
                ...options,
            })
        },
        [addToast]
    )

    const contextValue: ToastContextValue = {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        success,
        error,
        warning,
        info,
    }

    useEffect(() => {
        // 컴포넌트 언마운트 시 모든 타이머 정리
        return () => {
            console.log('[ToastProvider] 언마운트, 모든 타이머 정리')
            timersRef.current.forEach(timer => {
                clearTimeout(timer)
            })
            timersRef.current.clear()
        }
    }, [])

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    )
}

export const useToast = (): ToastContextValue => {
    const context = useContext(ToastContext)

    // Provider 외부에서 사용 시 에러 발생
    if (!context) {
        throw new Error('useToast must be used within ToastProvider. ' + 'ToastProvider로 컴포넌트를 감싸주세요.')
    }

    return context
}
