import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

//Components
import AlbumSetting from '../components/Album/AlbumSetting'
import Card from '../components/Album/Card'
import Category from '../components/Album/Category'
import FlottingButton from '../components/common/FlottingButton'
import Header from '../components/common/Header'
import { Modal } from '../components/common/Modal'

//Custom Hooks
import useModal from '../hooks/useModal'

//APIs
import { deleteAlbum, getAlbumAccess, getAlbumDetail } from '../api/album'
//Stores
import useCollectionStore from '../stores/collectionStore'

//Assets
import Cluster from '@/components/Album/Cluster'
import Arrow_Right from '../assets/icons/Arrow Right.png'
import iconDuplicated from '../assets/icons/icon_duplicated.png'
import iconShaky from '../assets/icons/icon_shaky.png'
import images_icon from '../assets/icons/images_icon.png'
import MovingDotsLoader from '../components/common/MovingDotsLoader'
import { ApiResponse } from '../types'

const mockClusters = [
    {
        clusterId: 9,
        clusterName: '사람-1',
        representativePicture: 'https://cdn.ongi.today/87f49929-aaed-408d-8962-9c3013729a25.jpeg',
        bboxX1: 2622,
        bboxY1: 1375,
        bboxX2: 2932,
        bboxY2: 1712,
        clusterPicture: [
            'https://cdn.ongi.today/87f49929-aaed-408d-8962-9c3013729a25.jpeg',
            'https://cdn.ongi.today/5709524e-d316-44c2-a6bd-bf9a47a9a394.jpeg',
        ],
    },
    {
        clusterId: 10,
        clusterName: '사람-2',
        representativePicture: 'https://cdn.ongi.today/87f49929-aaed-408d-8962-9c3013729a25.jpeg',
        bboxX1: 3345,
        bboxY1: 1087,
        bboxX2: 4032,
        bboxY2: 1983,
        clusterPicture: [
            'https://cdn.ongi.today/87f49929-aaed-408d-8962-9c3013729a25.jpeg',
            'https://cdn.ongi.today/5709524e-d316-44c2-a6bd-bf9a47a9a394.jpeg',
        ],
    },
    {
        clusterId: 11,
        clusterName: '사람-3',
        representativePicture: 'https://cdn.ongi.today/87f49929-aaed-408d-8962-9c3013729a25.jpeg',
        bboxX1: 1247,
        bboxY1: 1024,
        bboxX2: 1679,
        bboxY2: 1531,
        clusterPicture: [
            'https://cdn.ongi.today/87f49929-aaed-408d-8962-9c3013729a25.jpeg',
            'https://cdn.ongi.today/5709524e-d316-44c2-a6bd-bf9a47a9a394.jpeg',
        ],
    },
    {
        clusterId: 12,
        clusterName: '사람-4',
        representativePicture: 'https://cdn.ongi.today/87f49929-aaed-408d-8962-9c3013729a25.jpeg',
        bboxX1: 514,
        bboxY1: 395,
        bboxX2: 908,
        bboxY2: 850,
        clusterPicture: [
            'https://cdn.ongi.today/87f49929-aaed-408d-8962-9c3013729a25.jpeg',
            'https://cdn.ongi.today/5709524e-d316-44c2-a6bd-bf9a47a9a394.jpeg',
        ],
    },
    {
        clusterId: 13,
        clusterName: '사람-5',
        representativePicture: 'https://cdn.ongi.today/87f49929-aaed-408d-8962-9c3013729a25.jpeg',
        bboxX1: 1192,
        bboxY1: 591,
        bboxX2: 1444,
        bboxY2: 862,
        clusterPicture: [
            'https://cdn.ongi.today/87f49929-aaed-408d-8962-9c3013729a25.jpeg',
            'https://cdn.ongi.today/5709524e-d316-44c2-a6bd-bf9a47a9a394.jpeg',
        ],
    },
    {
        clusterId: 14,
        clusterName: '사람-6',
        representativePicture: 'https://cdn.ongi.today/87f49929-aaed-408d-8962-9c3013729a25.jpeg',
        bboxX1: 2173,
        bboxY1: 800,
        bboxX2: 2399,
        bboxY2: 1083,
        clusterPicture: [
            'https://cdn.ongi.today/87f49929-aaed-408d-8962-9c3013729a25.jpeg',
            'https://cdn.ongi.today/5709524e-d316-44c2-a6bd-bf9a47a9a394.jpeg',
        ],
    },
]
interface Cluster {
    clusterId: string | number
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
    const navigate = useNavigate()
    const { albumId } = useParams<{ albumId: string }>()
    const [albumData, setAlbumData] = useState<AlbumData>()

    const [isLoading, setIsLoading] = useState(true)
    // 카테고리와 인물 분류 섹션 각각의 인디케이터 상태 분리
    const [showCategoryRightIndicator, setShowCategoryRightIndicator] = useState(true)
    const [showClusterRightIndicator, setShowClusterRightIndicator] = useState(true)

    const { isOpen, modalData, openModal, closeModal } = useModal()
    const { setPicturesAndCategorize, tagCollections, allCollection, duplicatedCollection, shakyCollection } =
        useCollectionStore()

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
                    const pictures: Picture[] = response.data.picture
                    await setPicturesAndCategorize(albumId, pictures)
                }
                // setClusters(response.data.cluster)
                setClusters(mockClusters)
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
            <div className='mt-2 ml-4 font-sans text-lg'>{albumData?.title}</div>
            <Card />
            <div className='m-4 mt-6'>
                <div className='flex items-center justify-between'>
                    <div className='ml-4 font-sans text-md'>카테고리 </div>
                    <button onClick={() => navigate(`/album/${albumId}/전체`)} className='px-2'>
                        <div className='flex items-center '>
                            <img src={images_icon} className='h-4'></img>
                            <div className='px-2 text-xs tracking-tighter'>전체 {allCollection.count} 개 사진 보기</div>
                        </div>
                    </button>
                </div>

                <div className='relative'>
                    <div
                        className='flex flex-row w-full gap-2 px-2 py-4 overflow-x-auto scrollbar-thin scrollbar-gray-light scrollbar-track-gray-light'
                        onScroll={handleCategoryScroll}
                    >
                        {tagCollections &&
                            tagCollections.map((category: Category, index: number) => (
                                <Category title={category.name} pictures={category.pictures} albumId={albumId} />
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
                        {clusters && clusters.map((cluster: Cluster, index) => <Cluster cluster={cluster} />)}
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
                        albumId={albumId}
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
