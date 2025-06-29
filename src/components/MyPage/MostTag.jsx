import { useUserActivities } from '@/hooks/useUser'
import { GridWithChildren } from '../common/GridWithChildren'

const MostTag = () => {
    // 현재 년월 생성 (예: "2025-01")
    const currentYearMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

    const { data: activitiesData, isLoading, error } = useUserActivities(currentYearMonth)

    // 로딩 상태 처리
    if (isLoading) {
        return (
            <div className='p-5 m-2 transition bg-gray-100 shadow-md box-shadow rounded-xl'>
                <div className='animate-pulse'>
                    <div className='h-6 mb-4 bg-gray-300 rounded'></div>
                    <GridWithChildren col={2}>
                        <div className='bg-gray-300 rounded aspect-square'></div>
                        <div className='bg-gray-300 rounded aspect-square'></div>
                        <div className='bg-gray-300 rounded aspect-square'></div>
                        <div className='bg-gray-300 rounded aspect-square'></div>
                    </GridWithChildren>
                </div>
            </div>
        )
    }

    // 에러 상태 처리
    if (error) {
        return (
            <div className='p-5 m-2 transition bg-gray-100 shadow-md box-shadow rounded-xl'>
                <div className='text-red-500'>활동 데이터를 불러오는 중 오류가 발생했습니다.</div>
            </div>
        )
    }

    // 데이터가 없는 경우
    if (!activitiesData?.tag) {
        return (
            <div className='p-5 m-2 transition bg-gray-100 shadow-md box-shadow rounded-xl'>
                <div className='text-gray-500'>이번 달 활동 데이터가 없습니다.</div>
            </div>
        )
    }

    return (
        <div className='p-5 m-2 transition bg-gray-100 shadow-md box-shadow rounded-xl'>
            <div className='mb-4 text-lg font-semibold text-gray-700'>{activitiesData.tag}</div>
            <GridWithChildren col={2}>
                {(activitiesData.pictureUrls || []).map((element, index) => (
                    <img
                        key={index}
                        src={element}
                        alt={`${activitiesData.tag} 관련 사진 ${index + 1}`}
                        className='object-cover w-full h-full p-2 rounded-lg aspect-square'
                        onError={e => {
                            // 이미지 로드 실패 시 처리
                            e.currentTarget.style.display = 'none'
                        }}
                    />
                ))}
            </GridWithChildren>

            {/* 사진이 없는 경우 */}
            {(!activitiesData.pictureUrls || activitiesData.pictureUrls.length === 0) && (
                <div className='py-8 text-center text-gray-500'>해당 태그의 사진이 없습니다.</div>
            )}
        </div>
    )
}

export default MostTag
