import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

//Components
import AlbumTitle from '@/components/Album/AlbumTitle'
import Cluster from '@/components/Album/Cluster'
import AlbumSetting from '../components/Album/AlbumSetting'
import Card from '../components/Album/Card'
import Category from '../components/Album/Category'
import FlottingButton from '../components/common/FlottingButton'
import Header from '../components/common/Header'
import { Modal } from '../components/common/Modal'
import MovingDotsLoader from '../components/common/MovingDotsLoader'

//Custom Hooks
import useModal from '../hooks/useModal'

//APIs
import { deleteAlbum, getAlbumAccess, getAlbumDetail } from '../api/album'

//Stores
import useCollectionStore from '../stores/collectionStore'

//Assets
import Arrow_Right from '../assets/icons/Arrow Right.png'
import iconDuplicated from '../assets/icons/icon_duplicated.png'
import iconShaky from '../assets/icons/icon_shaky.png'
import images_icon from '../assets/icons/images_icon.png'

//Types
import CommentButton from '@/components/Album/CommentButton'
import CommentsContainer from '@/components/Album/CommentsContainer'
import LikeButton from '@/components/Album/LikeButton'
import SideScrollableSection from '@/components/Album/SideScrollableSection'
import { APIResponse } from '@/types/api.types'
import { RawPicture } from '../types'

interface ClusterInterface {
    clusterId: string
    clusterName: string
    representativePicture: string
    bboxX1: number
    bboxY1: number
    bboxX2: number
    bboxY2: number
    clusterPicture: string[]
}

interface Picture {
    id: string | number
    url: string
    name?: string
}

interface Category {
    name: string
    pictures: Picture[]
}

interface AlbumAccessResponse {
    data: {
        role: 'OWNER' | 'NORMAL' | string
    }
}

interface AlbumData {
    id: string
    title?: string
}

const Album = () => {
    const { albumId } = useParams<{ albumId: string }>()
    const [albumData, setAlbumData] = useState<AlbumData>()
    const [isCommentsOpen, setIsCommentsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [showCategoryRightIndicator, setShowCategoryRightIndicator] = useState<boolean>(true)
    const [showClusterRightIndicator, setShowClusterRightIndicator] = useState<boolean>(true)

    const navigate = useNavigate()

    const { isOpen, modalData, openModal, closeModal } = useModal()

    const {
        setPicturesAndCategorize,
        tagCollections,
        allCollection,
        duplicatedCollection,
        shakyCollection,
        setClusterCollections,
    } = useCollectionStore()

    const [clusters, setClusters] = useState<Cluster[]>([])
    const [commentCount, setCommentCount] = useState(0)

    const handleSettingClick = () => {
        openModal('설정')
    }

    const onchangeName = () => {
        console.log('클러스터 이름 변경 알림')
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result: APIResponse = await getAlbumAccess(albumId as string)
                const role = result.data.role
                if (role !== 'OWNER' && role !== 'NORMAL') {
                    navigate('/main')
                }
                const response = await getAlbumDetail(albumId as string)
                setAlbumData(response.data)

                // 사진 데이터를 스토어에 전달하고 자동 카테고라이징
                if (response.data && response.data.picture) {
                    // 스토어에 원본 사진 데이터 전달 - 내부적으로 카테고라이징 실행
                    const pictures: RawPicture[] = response.data.picture
                    await setPicturesAndCategorize(albumId as string, pictures)
                }

                setClusters(response.data.cluster)
                setClusterCollections(albumId as string, response.data.cluster)
                // setClusters(mockClusters)
                // setClusterCollections(albumId, mockClusters)

                setIsLoading(false)
            } catch (error) {
                navigate('/main')
            }
        }

        fetchData()
    }, [albumId])

    if (isLoading) {
        return (
            <>
                <Header />
                <MovingDotsLoader />
            </>
        )
    }

    return (
        <>
            <Header />
            <div className='relative'>
                <AlbumTitle title={albumData?.title || ''} />
                <Card />
                <div className='flex m-4'>
                    {/* 좋아요 버튼 */}
                    <LikeButton albumId={albumId as string} showCount={true} />

                    {/* 댓글 버튼 */}
                    <CommentButton showCount={false} onClick={() => setIsCommentsOpen(true)} />
                    <div className='m-4 cursor-pointer text-md' onClick={handleSettingClick}>
                        앨범 설정
                    </div>
                </div>
            </div>

            <div className='m-4 mt-6 bg-transparent'>
                <div className='flex items-center justify-between'>
                    <div className='ml-4 font-sans text-md'>카테고리 </div>
                    <button onClick={() => navigate(`/album/${albumId}/전체`)} className='px-2'>
                        <div className='flex items-center '>
                            <img src={images_icon} className='h-4'></img>
                            <div className='px-2 text-xs tracking-tighter'>
                                전체 {allCollection?.count} 개 사진 보기
                            </div>
                        </div>
                    </button>
                </div>

                <SideScrollableSection>
                    {tagCollections &&
                        tagCollections.map(category => (
                            <Category
                                key={category.name}
                                title={category.name}
                                pictures={category.pictures}
                                albumId={albumId as string}
                            />
                        ))}
                </SideScrollableSection>
            </div>

            <div className='m-4 mt-6'>
                {clusters.length !== 0 ? (
                    <>
                        <div className='ml-4 font-sans text-md'>인물 분류</div>
                        <SideScrollableSection>
                            {clusters &&
                                clusters.map((cluster: Cluster, index) => (
                                    <Cluster
                                        key={cluster.clusterId || index}
                                        albumId={albumId as string}
                                        cluster={cluster as ClusterInterface}
                                    />
                                ))}
                        </SideScrollableSection>
                    </>
                ) : (
                    ' '
                )}
            </div>

            <div className='m-4 mt-6'>
                <div className='ml-4 font-sans text-md'>검토해줘 </div>

                <div className='m-4'>
                    <button
                        className='flex items-center justify-between w-full bg-gray-100 border-0 border-b border-gray-200 focus:outline-none'
                        onClick={() => navigate(`/album/${albumId}/중복`)}
                    >
                        <div className='flex items-center'>
                            <div className='flex items-center justify-center flex-shrink-0 w-8 h-8 mr-4 rounded-lg bg-gray-50'>
                                <img src={iconDuplicated}></img>
                            </div>
                            <div className='text-sm text-gray-dark'>중복된 사진</div>
                        </div>
                        <img className='m-2 size-2' src={Arrow_Right} />
                    </button>
                </div>

                <div className='m-4'>
                    <button
                        className='flex items-center justify-between w-full bg-gray-100 border-0 border-b border-gray-200 focus:outline-none'
                        onClick={() => navigate(`/album/${albumId}/흔들림`)}
                    >
                        <div className='flex items-center'>
                            <div className='flex items-center justify-center flex-shrink-0 w-8 h-8 mr-4 rounded-lg bg-gray-50'>
                                <img src={iconShaky}></img>
                            </div>
                            <div className='text-sm text-gray-dark'>흔들린 사진</div>
                        </div>
                        <img className='m-2 size-2' src={Arrow_Right} />
                    </button>
                </div>
            </div>

            {/* 댓글 컨테이너 */}
            <CommentsContainer
                albumId={albumId as string}
                isOpen={isCommentsOpen}
                onClose={() => setIsCommentsOpen(false)}
                onHeightChange={height => console.log('Height changed:', height)}
            />

            <FlottingButton albumId={albumId as string} />

            {/*Modal*/}
            <Modal isOpen={isOpen} onClose={closeModal} title={modalData}>
                {modalData && (
                    <AlbumSetting
                        albumId={albumId as string}
                        albumName={albumData?.title || ' '}
                        handleDelete={() => {
                            deleteAlbum(albumId as string)
                            navigate('/main')
                        }}
                    />
                )}
            </Modal>
        </>
    )
}

export default Album
