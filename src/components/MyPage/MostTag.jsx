import { getUserActivities } from '@/api/user'
import { useEffect, useState } from 'react'
import { GridWithChildren } from '../common/GridWithChildren'

const MostTag = () => {
    const [data, setData] = useState({})
    useEffect(() => {
        const getUserData = async () => {
            const response = await getUserActivities('')
            console.log(response.data)
            setData({ tag: response.data.tag, pictureUrls: response.data.pictureUrls })
        }
        getUserData()
    }, [])
    return (
        <div className='p-5 m-2 transition bg-gray-100 shadow-md box-shadow rounded-xl'>
            <div>{data.tag}</div>
            <GridWithChildren col={2}>
                {(data?.pictureUrls || []).map((element, index) => (
                    <img key={index} src={element} className='object-cover w-full h-full p-2 aspect-square' />
                ))}
            </GridWithChildren>
        </div>
    )
}

export default MostTag
