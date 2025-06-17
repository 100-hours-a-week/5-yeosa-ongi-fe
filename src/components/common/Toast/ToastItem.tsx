import { useToast } from '@/contexts/ToastContext'
import { Toast } from '@/types/toast.type'
import { useEffect, useState } from 'react'

interface ToastItemProps {
    toast: Toast
}

const ToastItem = ({ toast }: ToastItemProps) => {
    const { removeToast } = useToast()

    /**
     * 토스트 표시 상태
     * - false: 숨김 (오른쪽에서 밀려나온 상태)
     * - true: 표시 (화면에 완전히 나타난 상태)
     */
    const [isVisible, setIsVisible] = useState(false)

    /**
     * 토스트 제거 애니메이션 상태
     * - false: 정상 상태
     * - true: 제거 애니메이션 중 (오른쪽으로 밀려들어가는 중)
     */
    const [isExiting, setIsExiting] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10)
        return () => clearTimeout(timer)
    }, [])

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

    /**
     * 토스트 타입별 스타일 클래스 반환
     */
    const getToastStyles = (): string => {
        const baseStyles =
            'p-4 rounded-lg shadow-lg border-l-4 max-w-sm w-full transition-all duration-300 cursor-pointer'

        // 타입별 색상 스타일
        const typeStyles = {
            success: 'bg-green-50 border-green-500 text-green-800',
            error: 'bg-red-50 border-red-500 text-red-800',
            warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
            info: 'bg-blue-50 border-blue-500 text-blue-800',
        }

        // 애니메이션 상태별 스타일
        const animationStyles = isExiting
            ? 'translate-x-full opacity-0' // 제거: 오른쪽으로 슬라이드 + 투명
            : isVisible
              ? 'translate-x-0 opacity-100' // 표시: 제자리 + 불투명
              : 'translate-x-full opacity-0' // 초기: 오른쪽에 숨김 + 투명

        return `${baseStyles} ${typeStyles[toast.type]} ${animationStyles}`
    }

    /**
     * 토스트 타입별 아이콘 반환
     */
    const getIcon = (): string => {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
        }
        return icons[toast.type]
    }

    return (
        <div
            className={getToastStyles()}
            onClick={handleRemove} // 클릭 시 제거
        >
            <div className='flex items-start'>
                {/* 아이콘 */}
                <span className='flex-shrink-0 mr-3 text-lg'>{getIcon()}</span>

                {/* 메시지 내용 */}
                <div className='flex-1 min-w-0'>
                    {' '}
                    {/* min-w-0으로 텍스트 오버플로우 방지 */}
                    {toast.title && <h4 className='mb-1 text-sm font-semibold'>{toast.title}</h4>}
                    <p className='text-sm leading-relaxed'>{toast.message}</p>
                </div>

                {/* 닫기 버튼 */}
                <button
                    onClick={e => {
                        e.stopPropagation() // 부모 onClick 이벤트 방지
                        handleRemove()
                    }}
                    className='flex-shrink-0 ml-2 text-gray-400 transition-colors duration-200 hover:text-gray-600'
                    aria-label='토스트 닫기'
                >
                    <span className='text-lg leading-none'>×</span>
                </button>
            </div>
        </div>
    )
}

export default ToastItem
