import { useTotalStatistics } from '@/hooks/useUser'
import { useNavigate } from 'react-router-dom'

// Assets
import albumIcon from '@/assets/icons/images_icon.png'
import locationIcon from '@/assets/icons/location_icon.png'

const Intro = () => {
    const navigate = useNavigate()

    // ✅ React Query 훅을 컴포넌트 최상위에서 호출
    const { data: statisticsData, isLoading, error } = useTotalStatistics()

    // 로딩 상태 처리
    if (isLoading) {
        return (
            <div className='flex gap-8 h-[40px] relative border-solid items-center p-3 m-2 text-gray-700 bg-gray-100 shadow-md box-shadow rounded-xl'>
                <div>내 활동</div>
                <div className='flex flex-row items-center gap-2'>
                    <img className='size-4' src={albumIcon} alt='Album icon' />
                    <div className='w-6 h-4 text-sm bg-gray-300 rounded animate-pulse'></div>
                </div>
                <div className='flex flex-row items-center gap-2'>
                    <img className='size-4' src={locationIcon} alt='Location icon' />
                    <div className='w-6 h-4 text-sm bg-gray-300 rounded animate-pulse'></div>
                </div>
            </div>
        )
    }

    // 에러 상태 처리
    if (error) {
        return (
            <div className='flex gap-8 h-[40px] relative border-solid items-center p-3 m-2 text-gray-700 bg-gray-100 shadow-md box-shadow rounded-xl'>
                <div>내 활동</div>
                <div className='flex flex-row items-center gap-2'>
                    <img className='size-4' src={albumIcon} alt='Album icon' />
                    <div className='text-sm text-red-500'>-</div>
                </div>
                <div className='flex flex-row items-center gap-2'>
                    <img className='size-4' src={locationIcon} alt='Location icon' />
                    <div className='text-sm text-red-500'>-</div>
                </div>
            </div>
        )
    }

    // 데이터에서 카운트 추출 (기본값 설정)
    const albumCount = statisticsData?.albumCount || statisticsData?.totalPhotos || 0
    const locationCount = statisticsData?.placeCount || statisticsData?.totalPlaces || 0

    return (
        <div className='flex gap-8 h-[40px] relative border-solid items-center p-3 m-2 text-gray-700 bg-gray-100 shadow-md box-shadow rounded-xl'>
            <div>내 활동</div>

            <div className='flex flex-row items-center gap-2'>
                <img className='size-4' src={albumIcon} alt='Album icon' />
                <div className='text-sm font-medium'>{albumCount.toLocaleString()}</div>
            </div>

            <div className='flex flex-row items-center gap-2'>
                <img className='size-4' src={locationIcon} alt='Location icon' />
                <div className='text-sm font-medium'>{locationCount.toLocaleString()}</div>
            </div>
        </div>
    )
}

export default Intro
