import { useNavigate } from 'react-router-dom'

// APIs

//Assets

//Types
import { useTotalStatistics } from '@/hooks/useUser'
import ImageIcon from '@/icons/ImageIcon'
import LocationIcon from '@/icons/LocationIcon'

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
                        <ImageIcon variant='multiple' className='w-4 h-4 text-gray-400' />
                        <div className='text-sm'>{data?.albumCount}</div>
                    </div>
                    <div className='absolute flex flex-row items-center gap-2 left-1/4'>
                        <LocationIcon className='w-4 h-4 text-gray-400' />
                        <div className='text-sm '>{data?.placeCount}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AlbumListHeader
