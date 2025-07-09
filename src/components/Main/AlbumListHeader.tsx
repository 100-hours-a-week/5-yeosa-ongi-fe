import Icon from '@/components/common/Icon'

import { useTotalStatistics } from '@/hooks/useUser'

const AlbumListHeader = () => {
    const { data } = useTotalStatistics()

    return (
        <div className='z-20 border-b'>
            <div className='p-2 h-[48px] flex flew-row border-t-2 border-solid  items-center space-x-10'>
                <div className='flex flex-row items-center gap-2 '>
                    <Icon name='image' variant='multiple' className='w-4 h-4 text-gray-500' />
                    <div className='text-sm text-gray-600'>{data?.albumCount}</div>
                </div>
                <div className='flex flex-row items-center gap-2 '>
                    <Icon name='location' className='w-4 h-4 text-gray-500' />
                    <div className='text-sm text-gray-600 '>{data?.placeCount}</div>
                </div>
            </div>
        </div>
    )
}

export default AlbumListHeader
