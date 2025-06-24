import { useToast } from '@/contexts/ToastContext'
import { Toast } from '@/types/toast.type'
import { useEffect, useRef, useState } from 'react'

interface ToastItemProps {
    toast: Toast
}

const ToastItem = ({ toast }: ToastItemProps) => {
    const { removeToast } = useToast()

    const [isVisible, setIsVisible] = useState(false)

    //카운트 다운 상태
    const [isPaused, setIsPaused] = useState(false)
    const [progress, setProgress] = useState(100)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(Date.now())

    // toast.isRemoving이 Context에서 관리되므로 로컬 isExiting 상태 제거

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!toast.duration || toast.duration <= 0 || isPaused || toast.isRemoving) return

        const startTime = startTimeRef.current
        const totalDuration = toast.duration

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime
            const remaining = Math.max(0, totalDuration - elapsed)
            const progressPercent = (remaining / totalDuration) * 100

            setProgress(progressPercent)

            if (remaining <= 0) {
                handleRemove()
            }
        }, 20)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [toast.duration, isPaused, toast.isRemoving])

    /**
     * 토스트 제거 시 애니메이션을 포함한 처리
     */
    const handleRemove = () => {
        if (toast.isRemoving) return // 이미 제거 중이면 중복 실행 방지

        console.log('[ToastItem] 제거 요청:', toast.id)
        removeToast(toast.id)
    }

    /**
     * 토스트 타입별 스타일 클래스 반환
     */
    const getContainerStyles = (): string => {
        const baseStyles = 'relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform'
        const sizeStyles = 'max-h-16'

        // Context의 isRemoving 플래그 사용
        if (toast.isRemoving) {
            return `${baseStyles} ${sizeStyles} opacity-0 scale-95 transition-all duration-[1000ms] ease-out`
        } else if (isVisible) {
            return `${baseStyles} ${sizeStyles} opacity-100 scale-100 transition-all duration-300 ease-out`
        } else {
            return `${baseStyles} ${sizeStyles} opacity-0 scale-95`
        }
    }

    const getIconStyles = (): string => {
        const iconStyles = {
            success: 'bg-primary',
            error: 'bg-red-500',
            warning: 'bg-primary',
            info: 'bg-primary',
        }
        return `w-4 h-4 rounded-full flex items-center justify-center text-white text-sm ${iconStyles[toast.type]}`
    }

    const getProgressBarStyles = (): string => {
        const progressStyles = {
            success: 'bg-primary',
            error: 'bg-red-500',
            warning: 'bg-primary',
            info: 'bg-primary',
        }
        return `absolute bottom-0 right-0 h-1 transition-all duration-100 ease-linear ${progressStyles[toast.type]}`
    }

    const getIcon = (): string => {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '!',
            info: 'i',
        }
        return icons[toast.type]
    }

    return (
        <div className={getContainerStyles()}>
            {/* 메인 콘텐츠 */}
            <div className='p-2'>
                <div className='flex items-center justify-between'>
                    {/* 왼쪽: 아이콘 + 메시지 */}
                    <div className='flex items-center flex-1 min-w-0 mb-1 space-x-3'>
                        {/* 아이콘 */}
                        <div className={getIconStyles()}>{getIcon()}</div>

                        {/* 메시지 내용 */}
                        <div className='flex-1 min-w-0'>
                            <div className='text-sm text-gray-900'>{toast.message || 'Changes saved'}</div>
                        </div>
                    </div>

                    {/* 오른쪽: 컨트롤 버튼들 */}
                    <div className='flex items-center ml-4 space-x-2'>
                        {/* 닫기 버튼 */}
                        <button
                            onClick={handleRemove}
                            className='p-1 text-gray-400 transition-colors duration-200 hover:text-gray-600'
                            aria-label='닫기'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M6 18L18 6M6 6l12 12'
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* 진행 바 */}
            {toast.duration && toast.duration > 0 && !isPaused && !toast.isRemoving && (
                <div className={getProgressBarStyles()} style={{ width: `${progress}%` }} />
            )}
        </div>
    )
}

export default ToastItem
