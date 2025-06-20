import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// APIs
import { getTotalData } from '@/api/user'

//Assets
import communityIcon from '@/assets/icons/community_icon.png'
import albumIcon from '@/assets/icons/images_icon.png'
import locationIcon from '@/assets/icons/location_icon.png'

const AlbumListHeader = () => {
    const navigate = useNavigate()
    const [counts, setCounts] = useState({
        albums: 0,
        locations: 0,
    })

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const result = await getTotalData()
                console.log('리스트 헤더', result.data)
                setCounts({
                    albums: result.data.albumCount || 0,
                    locations: result.data.locationCount || 0,
                })
            } catch (error) {
                console.error(error)
            }
        }
        loadInitialData()
    }, [])

    return (
        <div className='h-[48px] relative border-t-2 border-solid  items-center '>
            <div className='p-2'>
                <div className='absolute flex flex-row items-center gap-2 '>
                    <img className='size-4' src={albumIcon} alt='Album icon' />
                    <div className='text-sm'>{counts.albums}</div>
                </div>
                <div className='absolute flex flex-row items-center gap-2 left-1/4'>
                    <img className='size-4' src={locationIcon} alt='Location icon' />
                    <div className='text-sm '>{counts.locations}</div>
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
    )
}

export default AlbumListHeader
