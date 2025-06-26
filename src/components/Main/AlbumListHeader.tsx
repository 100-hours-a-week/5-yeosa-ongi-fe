import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

// APIs
import { getTotalData } from '@/api/user'

//Assets
import communityIcon from '@/assets/icons/community_icon.png'
import albumIcon from '@/assets/icons/images_icon.png'
import locationIcon from '@/assets/icons/location_icon.png'

//Types
import { ApiResponse } from '@/types'

type ResponseValue = {
    albumCount: string
    placeCount: string
}

const AlbumListHeader = () => {
    const { data } = useQuery<ApiResponse<ResponseValue>>({
        queryKey: ['listHeader'],
        queryFn: getTotalData,
        staleTime: 1000 * 10,
    })

    const navigate = useNavigate()

    return (
        <div className='z-20 bg-white border-b'>
            <div className='h-[48px] relative border-t-2 border-solid  items-center '>
                <div className='p-2'>
                    <div className='absolute flex flex-row items-center gap-2 '>
                        <img className='size-4' src={albumIcon} alt='Album icon' />
                        <div className='text-sm'>{data?.data?.albumCount}</div>
                    </div>
                    <div className='absolute flex flex-row items-center gap-2 left-1/4'>
                        <img className='size-4' src={locationIcon} alt='Location icon' />
                        <div className='text-sm '>{data?.data?.placeCount}</div>
                    </div>
                    <div>
                        <button
                            className='absolute flex flex-row items-center gap-1 right-4'
                            onClick={() => navigate('/community')}
                        >
                            <div className='text-sm text-primary'>community</div>
                            <img className='size-4' src={communityIcon} alt='Community icon' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AlbumListHeader
