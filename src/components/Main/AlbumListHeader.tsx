import { useNavigate } from 'react-router-dom'

// APIs

//Assets
import albumIcon from '@/assets/icons/images_icon.png'
import locationIcon from '@/assets/icons/location_icon.png'

//Types
import { useTotalStatistics } from '@/hooks/useUser'

type ResponseValue = {
    albumCount: string
    placeCount: string
}

const AlbumListHeader = () => {
    const { data } = useTotalStatistics()

    const navigate = useNavigate()

    return (
        <div className='z-20 bg-white border-b'>
            <div className='h-[48px] relative border-t-2 border-solid  items-center '>
                <div className='p-2'>
                    <div className='absolute flex flex-row items-center gap-2 '>
                        <img className='size-4' src={albumIcon} alt='Album icon' />
                        <div className='text-sm'>{data?.albumCount}</div>
                    </div>
                    <div className='absolute flex flex-row items-center gap-2 left-1/4'>
                        <img className='size-4' src={locationIcon} alt='Location icon' />
                        <div className='text-sm '>{data?.placeCount}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AlbumListHeader
