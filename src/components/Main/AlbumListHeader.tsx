
// APIs

//Assets

//Types
import { useTotalStatistics } from '@/hooks/useUser'
import ImageIcon from '@/icons/ImageIcon'
import LocationIcon from '@/icons/LocationIcon'

const AlbumListHeader = () => {
    const { data } = useTotalStatistics()

    return (
        <div className='z-20 border-b'>
            <div className='p-2 h-[48px] flex flew-row border-t-2 border-solid  items-center space-x-10'>
                <div className='flex flex-row items-center gap-2 '>
                    <ImageIcon variant='multiple' className='w-4 h-4 text-gray-500' />
                    <div className='text-sm text-gray-600'>{data?.albumCount}</div>
                </div>
                <div className='flex flex-row items-center gap-2 '>
                    <LocationIcon className='w-4 h-4 text-gray-500' />
                    <div className='text-sm text-gray-600 '>{data?.placeCount}</div>
                </div>
            </div>
        </div>
    )
}

export default AlbumListHeader
