import { Toast, ToastContextValue, ToastProviderProps } from '@/types/toast.type'
import { createContext, useContext, useState } from 'react'

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider = ({ children, defaultDuration = 3000, maxToasts = 5 }: ToastProviderProps) => {
    // States
    const [toasts, setToasts] = useState<Toast[]>([])

    /**
     * 새로운 토스트 추가 함수
     * @param toastData
     * @returns
     */
    const addToast = (toastData: Omit<Toast, 'id' | 'createdAt'>): string => {
        // 고유 ID 생성
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`

        // 새로운 토스트 객체 생성
        const newToast: Toast = {
            ...toastData,
            id,
            createdAt: Date.now(),
            duration: toastData.duration ?? defaultDuration,
        }

        console.log('[ToastProvider] 토스트 추가:', {
            id,
            type: newToast.type,
            message: newToast.message,
        })

        // 상태 업데이트 (아직 간단한 버전)
        setToasts(prevToasts => [newToast, ...prevToasts])

        return id
    }

    /**
     * 토스트 제거 함수
     * @param id
     */
    const removeToast = (id: string): void => {
        console.log('[ToastProvider] 토스트 제거:', id)
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
    }

    /**
     * 모든 토스트 제거 함수
     */
    const clearAllToasts = (): void => {
        console.log('[ToastProvider] 모든 토스트 제거')
        setToasts([])
    }

    const contextValue: ToastContextValue = {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
    }

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {/*
            TODO: 나중에 여기에 ToastContainer 추가 예정
            지금은 Context 구조만 만드는 중
            */}
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
