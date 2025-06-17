/**
 * 토스트 메시지의 종류
 * 각 타입별로 다른 색상과 아이콘이 표시됩니다
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * 개별 토스트 메시지 데이터
 */
export interface Toast {
    id: string
    type: ToastType
    message: string
    title?: string
    duration?: number
    createdAt: number
}

/**
 * Context에서 제공할 값들의 타입
 * 아직 구현하지 않고 타입만 먼저 정의
 */
export interface ToastContextValue {
    /** 현재 표시 중인 토스트 목록 */
    toasts: Toast[]

    /** 새로운 토스트 추가 함수 */
    addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string

    /** 특정 토스트 제거 함수 */
    removeToast: (id: string) => void

    /** 모든 토스트 제거 함수 */
    clearAllToasts: () => void

    success: (message: string, options?: Partial<Toast>) => string
    error: (message: string, options?: Partial<Toast>) => string
    warning: (message: string, options?: Partial<Toast>) => string
    info: (message: string, options?: Partial<Toast>) => string
}

/**
 * Provider 컴포넌트가 받을 props 타입
 */
export interface ToastProviderProps {
    /** 자식 컴포넌트들 */
    children: React.ReactNode

    /** 기본 토스트 지속 시간 (선택적) */
    defaultDuration?: number

    /** 최대 토스트 개수 (선택적) */
    maxToasts?: number
}
