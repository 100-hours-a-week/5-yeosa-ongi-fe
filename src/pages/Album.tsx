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
import { ApiResponse, RawPicture } from '../types'

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

    /**
     * 카테고리 섹션 스크롤 이벤트 처리
     * @param e
     */
    const handleCategoryScroll = (e: React.UIEvent) => {
        const container = e.target as HTMLDivElement
        const isScrollEnd = container.scrollWidth - container.scrollLeft <= container.clientWidth + 10

        if (isScrollEnd) {
            setShowCategoryRightIndicator(false)
        } else {
            setShowCategoryRightIndicator(true)
        }
    }

    /**
     * 인물 분류 섹션 스크롤 이벤트 처리
     * @param e
     */
    const handleClusterScroll = (e: React.UIEvent) => {
        const container = e.target as HTMLDivElement
        const isScrollEnd = container.scrollWidth - container.scrollLeft <= container.clientWidth + 10

        if (isScrollEnd) {
            setShowClusterRightIndicator(false)
        } else {
            setShowClusterRightIndicator(true)
        }
    }

    const handleSettingClick = () => {
        openModal('설정')
    }

    const onchangeName = () => {
        console.log('클러스터 이름 변경 알림')
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result: ApiResponse = await getAlbumAccess(albumId as string)
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
            {/* <div className='absolute inset-0 w-full h-full -z-50'>
                <Background></Background>
            </div> */}
            <div className='relative'>
                <AlbumTitle title={albumData?.title || ''} />
                <Card />
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

                <div className='relative'>
                    <div
                        className='flex flex-row w-full gap-2 px-2 py-4 overflow-x-auto scrollbar-thin scrollbar-gray-light scrollbar-track-gray-light'
                        onScroll={handleCategoryScroll}
                    >
                        {tagCollections &&
                            tagCollections.map(category => (
                                <Category
                                    title={category.name}
                                    pictures={category.pictures}
                                    albumId={albumId as string}
                                />
                            ))}
                    </div>
                    {showCategoryRightIndicator && (
                        <div className='absolute top-0 right-0 flex items-center justify-end w-16 h-full pointer-events-none bg-gradient-to-l from-white to-transparent'>
                            <div className='flex items-center justify-center w-8 h-8 mr-2 bg-white rounded-full shadow-sm bg-opacity-70'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='w-5 h-5 text-gray-500'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M9 5l7 7-7 7'
                                    />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className='m-4 mt-6'>
                {clusters.length !== 0 ? <div className='ml-4 font-sans text-md'>인물 분류</div> : ' '}
                <div className='relative'>
                    <div
                        className='flex flex-row w-full gap-2 px-2 py-4 overflow-x-auto scrollbar-thin scrollbar-gray-light scrollbar-track-gray-light'
                        onScroll={handleClusterScroll}
                    >
                        {clusters &&
                            clusters.map((cluster: Cluster, index) => (
                                <Cluster albumId={albumId as string} cluster={cluster as ClusterInterface} />
                            ))}
                    </div>
                    {clusters.length !== 0 && showClusterRightIndicator && (
                        <div className='absolute top-0 right-0 flex items-center justify-end w-16 h-full pointer-events-none bg-gradient-to-l from-white to-transparent'>
                            <div className='flex items-center justify-center w-8 h-8 mr-2 bg-white rounded-full shadow-sm bg-opacity-70'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='w-5 h-5 text-gray-500'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M9 5l7 7-7 7'
                                    />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
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
                <div className='m-4 cursor-pointer text-md' onClick={handleSettingClick}>
                    앨범 설정
                </div>
            </div>
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
