import { useNavigate } from 'react-router-dom'

// Components
import Header from '../components/common/Header'

const Community = () => {
    const navigate = useNavigate()

    return (
        <>
            <Header showButtons={false} />
            <div className='flex flex-col items-center justify-center h-full p-6 bg-gray-50'>
                <div className='w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md'>
                    <div onClick={() => navigate(-1)} className='mb-4 text-5xl'>
                        🚧
                    </div>
                    <p className='text-gray-600'>커뮤니티 페이지는 현재 개발 중입니다.</p>
                </div>
            </div>
        </>
    )
}

export default Community
