import { useToast } from '@/contexts/ToastContext'
import React from 'react'
import ToastItem from './ToastItem'

/**
 * 모든 토스트를 화면에 표시하는 컨테이너 컴포넌트
 * 화면 우상단에 고정 위치로 표시
 */
const ToastContainer: React.FC = () => {
    const { toasts } = useToast()

    console.log('[ToastContainer] 렌더링, 토스트 수:', toasts.length)

    // 토스트가 없으면 아무것도 렌더링하지 않음
    if (toasts.length === 0) {
        return null
    }

    return (
        <div className='fixed top-0 left-0 right-0 z-50 pointer-events-none'>
            {/* pointer-events-none으로 컨테이너는 클릭 방지, 개별 토스트만 클릭 가능 */}
            <div className='flex flex-col gap-3 px-4 pt-4 pointer-events-auto'>
                {toasts.map(toast => (
                    <div key={toast.id} className='mb-2'>
                        <ToastItem toast={toast} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ToastContainer
