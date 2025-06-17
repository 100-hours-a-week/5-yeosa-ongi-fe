import { useToast } from '@/contexts/ToastContext'
import { Toast } from '@/types/toast.type'
import { useEffect, useRef, useState } from 'react'

interface ToastItemProps {
    toast: Toast
}

const ToastItem = ({ toast }: ToastItemProps) => {
    const { removeToast } = useToast()

    const [isVisible, setIsVisible] = useState(false)
    const [isExiting, setIsExiting] = useState(false)

    //카운트 다운 상태
    const [remainingTime, setRemainingTime] = useState(toast.duration || 0)
    const [isPaused, setIsPaused] = useState(false)
    const [progress, setProgress] = useState(100)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(Date.now())

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!toast.duration || toast.duration <= 0 || isPaused) return

        const startTime = startTimeRef.current
        const totalDuration = toast.duration

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime
            const remaining = Math.max(0, totalDuration - elapsed)
            const progressPercent = (remaining / totalDuration) * 100

            setRemainingTime(remaining)
            setProgress(progressPercent)

            if (remaining <= 0) {
                handleRemove()
            }
        }, 100) // 100ms마다 업데이트로 부드러운 애니메이션

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [toast.duration, isPaused])

    /**
     * 토스트 제거 시 애니메이션을 포함한 처리
     */
    const handleRemove = () => {
        console.log('[ToastItem] 제거 애니메이션 시작:', toast.id)

        // 1. 제거 애니메이션 시작
        setIsExiting(true)

        // 2. 300ms 후 실제 제거 (CSS transition과 맞춤)
        setTimeout(() => {
            removeToast(toast.id)
        }, 300)
    }

    const handlePauseToggle = () => {
        setIsPaused(!isPaused)
        if (!isPaused) {
            // 일시정지 시 현재 시간을 새로운 시작 시간으로 설정
            startTimeRef.current = Date.now() - (toast.duration! - remainingTime)
        }
    }

    /**
     * 토스트 타입별 스타일 클래스 반환
     */
    const getContainerStyles = (): string => {
        const baseStyles =
            'relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ease-out transform'

        const sizeStyles = 'max-h-16'

        const animationStyles = isExiting
            ? 'translate-x-full opacity-0 scale-95'
            : isVisible
              ? 'translate-x-0 opacity-100 scale-100'
              : 'translate-x-full opacity-0 scale-95'

        return `${baseStyles} ${sizeStyles} ${animationStyles}`
    }

    const getIconStyles = (): string => {
        const iconStyles = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500',
        }
        return `w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${iconStyles[toast.type]}`
    }

    const getProgressBarStyles = (): string => {
        const progressStyles = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500',
        }
        return `absolute bottom-0 left-0 h-1 transition-all duration-100 ease-linear ${progressStyles[toast.type]}`
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

    const formatTime = (ms: number): number => {
        return Math.ceil(ms / 1000)
    }

    return (
        <div className={getContainerStyles()}>
            {/* 메인 콘텐츠 */}
            <div className='p-4'>
                <div className='flex items-start justify-between'>
                    {/* 왼쪽: 아이콘 + 메시지 */}
                    <div className='flex items-start flex-1 min-w-0 space-x-3'>
                        {/* 아이콘 */}
                        <div className={getIconStyles()}>{getIcon()}</div>

                        {/* 메시지 내용 */}
                        <div className='flex-1 min-w-0'>
                            <div className='text-lg font-semibold text-gray-900'>{toast.title || 'Changes saved'}</div>(
                            <div className='mt-2 text-sm leading-relaxed text-gray-600'>
                                {toast.showCountdown && remainingTime > 0 && (
                                    <>
                                        This message will close in{' '}
                                        <span className='font-semibold text-gray-900'>{formatTime(remainingTime)}</span>{' '}
                                        seconds.{' '}
                                        {toast.pausable && (
                                            <button
                                                onClick={handlePauseToggle}
                                                className='font-semibold text-gray-900 underline hover:text-gray-700'
                                            >
                                                {isPaused ? 'Resume' : 'Click to stop'}.
                                            </button>
                                        )}
                                    </>
                                )}
                                {!toast.showCountdown && toast.message}
                            </div>
                            )
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
            {toast.duration && toast.duration > 0 && !isPaused && (
                <div className={getProgressBarStyles()} style={{ width: `${progress}%` }} />
            )}
        </div>
    )
}

export default ToastItem
