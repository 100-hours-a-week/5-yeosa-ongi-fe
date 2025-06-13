import { useEffect, useState } from 'react'

// APIs
import { getTotalData } from '@/api/user'

//Assets
import albumIcon from '@/assets/icons/images_icon.png'
import locationIcon from '@/assets/icons/location_icon.png'
import { useNavigate } from 'react-router-dom'

const Intro = () => {
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
                    locations: result.data.placeCount || 0,
                })
            } catch (error) {
                console.error(error)
            }
        }

        // Call the function immediately
        loadInitialData()
        // No need to call it again here
    }, [])

    return (
        <div className='flex gap-8 h-[40px] relative border-solid  items-center p-3 m-2 text-gray-700 bg-gray-100 shadow-md box-shadow rounded-xl'>
            <div> 내 활동 </div>
            <div className='flex flex-row items-center gap-2 '>
                <img className='size-4' src={albumIcon} alt='Album icon' />
                <div className='text-sm'>{counts.albums}</div>
            </div>
            <div className='flex flex-row items-center gap-2 left-1/4'>
                <img className='size-4' src={locationIcon} alt='Location icon' />
                <div className='text-sm '>{counts.locations}</div>
            </div>
        </div>
    )
}

export default Intro
