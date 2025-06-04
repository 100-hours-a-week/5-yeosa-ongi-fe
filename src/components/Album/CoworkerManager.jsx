import { useCallback, useEffect, useState } from 'react'

import { getAlbumAccess, getCoworkersList } from '../../api/album'
import Coworker from './Coworker'

const CoworkerManager = ({ albumId }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [coworkerList, setCoworkerList] = useState([])
    const [userRole, setUserRole] = useState(null)
    useEffect(() => {
        const fetchCoworkers = async () => {
            try {
                setLoading(true)
                setError(null)
                const result = await getCoworkersList(albumId)
                const response = await getAlbumAccess(albumId)
                setUserRole(response.data.role)
                setCoworkerList(result.data.userInfo)
            } catch (err) {
                console.error('공동 작업자 목록을 불러오는데 실패했습니다', err)
                setError('공동 작업자 목록을 불러오는데 실패했습니다.')
            } finally {
                setLoading(false)
            }
        }

        fetchCoworkers()
    }, [])

    const handleRemove = useCallback(
        userId => {
            const deleteCoworker = async () => {
                try {
                    const result = await deleteCoworker(albumId, userId)
                    console.log('삭제 성공!', result)
                    setCoworkerList(prev =>
                        prev.filter(coworker => coworker.userId !== userId)
                    )
                } catch (error) {
                    console.error('삭제 실패:', error)
                    // 사용자에게 에러 알림 표시
                }
            }
            deleteCoworker()
        },
        [albumId, coworkerList]
    )

    return (
        <>
            <div className='relative flex flex-col w-full h-full max-w-md mx-auto bg-white rounded-lg shadow-lg'>
                <div className='p-5 border-b'>
                    <h3 className='text-lg font-medium text-gray-800'>
                        공동 작업자
                    </h3>
                </div>
                <div>
                    {coworkerList.map((element, index) => {
                        return (
                            <Coworker
                                userId={element.userId}
                                nickname={element.nickname}
                                profileImageURL={element.profileImageURL}
                                role={element.role}
                                isOwner={userRole}
                                handleRemove={handleRemove}
                            />
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export default CoworkerManager
