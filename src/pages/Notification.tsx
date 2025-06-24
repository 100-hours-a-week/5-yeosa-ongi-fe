import { useNavigate } from 'react-router-dom'

// Assets
import Arrow_Left from '../assets/icons/Arrow_Left.png'

const Notification = () => {
    const navigate = useNavigate()
    return (
        <>
            <div className='flex flex-col min-h-screen'>
                {/* 헤더 */}
                <header className='h-[52px] relative flex items-center justify-center'>
                    <button
                        className='absolute left-4 top-1/4'
                        onClick={() => navigate(-1)}
                    >
                        <img
                            className='h-4 mt-2'
                            src={Arrow_Left}
                            alt='뒤로가기'
                        />
                    </button>
                    <h1 className='text-center'>알림</h1>
                </header>
                <div className='flex flex-col items-center justify-center h-full p-6 bg-gray-50'>
                    <div className='w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md'>
                        <div
                            onClick={() => navigate(-1)}
                            className='mb-4 text-5xl'
                        >
                            🚧
                        </div>
                        <p className='text-gray-600'>
                            알림 페이지는 현재 개발 중입니다.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Notification
