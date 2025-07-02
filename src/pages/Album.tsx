import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

//Components
import AlbumTitle from '@/components/Album/AlbumTitle'
import Cluster from '@/components/Album/Cluster'
import CommentButton from '@/components/Album/CommentButton'
import CommentsContainer from '@/components/Album/CommentsContainer'
import LikeButton from '@/components/Album/LikeButton'
import SideScrollableSection from '@/components/Album/SideScrollableSection'
import AlbumSetting from '../components/Album/AlbumSetting'
import Card from '../components/Album/Card'
import Category from '../components/Album/Category'
import FlottingButton from '../components/common/FlottingButton'
import Header from '../components/common/Header'
import { Modal } from '../components/common/Modal'
import MovingDotsLoader from '../components/common/MovingDotsLoader'

//Custom Hooks
import { useAlbumAccess, useAlbumComments, useAlbumDetail, useDeleteAlbum } from '@/hooks/useAlbum'
import useModal from '../hooks/useModal'

//Stores
import useCollectionStore from '../stores/collectionStore'

//Assets
import Arrow_Right from '../assets/icons/Arrow Right.png'
import iconDuplicated from '../assets/icons/icon_duplicated.png'
import iconShaky from '../assets/icons/icon_shaky.png'
import images_icon from '../assets/icons/images_icon.png'

//Types
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

interface AlbumData {
    id: string
    title?: string
}

const Album = () => {
    const { albumId } = useParams<{ albumId: string }>()
    const [isCommentsOpen, setIsCommentsOpen] = useState(false)
    const navigate = useNavigate()

    // React Query hooks
    const {
        data: albumDetail,
        isLoading: isDetailLoading,
        error: detailError,
    } = useAlbumDetail(albumId!, {
        enabled: !!albumId,
    })

    const {
        data: albumAccess,
        isLoading: isAccessLoading,
        error: accessError,
    } = useAlbumAccess(albumId!, {
        enabled: !!albumId,
    })

    const deleteAlbumMutation = useDeleteAlbum({
        onSuccess: () => {
            console.log('앨범 삭제 성공')
            navigate('/main')
        },
        onError: error => {
            console.error('앨범 삭제 실패:', error)
        },
    })

    const { data: commentsData } = useAlbumComments(albumId!)

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

    // 로딩 상태 통합
    const isLoading = isDetailLoading || isAccessLoading

    const handleSettingClick = () => {
        openModal('설정')
    }

    const handleDeleteAlbum = () => {
        if (albumId) {
            deleteAlbumMutation.mutate(albumId)
        }
    }

    useEffect(() => {
        // 아직 로딩 중이면 대기
        if (isDetailLoading || isAccessLoading) {
            return
        }

        // 에러 처리
        if (detailError || accessError) {
            console.error('앨범 데이터 로딩 실패:', detailError || accessError)
            navigate('/main')
            return
        }

        // 데이터가 아직 없으면 대기
        if (!albumDetail || !albumAccess) {
            return
        }

        // 권한 확인
        const role = albumAccess.role
        if (role !== 'OWNER' && role !== 'NORMAL') {
            console.warn('앨범 접근 권한이 없습니다.')
            navigate('/main')
            return
        }

        // 앨범 데이터 처리
        if (albumDetail.picture) {
            const pictures: RawPicture[] = albumDetail.picture
            setPicturesAndCategorize(albumId as string, pictures)
        }

        if (albumDetail.cluster) {
            setClusters(albumDetail.cluster)
            setClusterCollections(albumId as string, albumDetail.cluster)
        }
    }, [
        albumDetail,
        albumAccess,
        detailError,
        accessError,
        isDetailLoading,
        isAccessLoading,
        albumId,
        navigate,
        setPicturesAndCategorize,
        setClusterCollections,
    ])

    // 로딩 중일 때
    if (isLoading) {
        return (
            <>
                <Header />
                <MovingDotsLoader />
            </>
        )
    }

    // 데이터가 없을 때
    if (!albumDetail) {
        return (
            <>
                <Header />
                <div className='flex items-center justify-center h-64'>
                    <p>앨범을 찾을 수 없습니다.</p>
                </div>
            </>
        )
    }

    // ✅ 댓글 수는 React Query 데이터에서 직접 가져오기
    const commentCount = commentsData?.length || albumDetail.commentCount || 0

    return (
        <>
            <Header />
            <div className='relative'>
                <AlbumTitle title={albumDetail.title || ''} />
                <Card />
                <div className='flex m-4'>
                    {/* 좋아요 버튼 */}
                    <LikeButton albumId={albumId as string} showCount={true} />

                    {/* 댓글 버튼 */}
                    <CommentButton
                        commentCount={commentCount}
                        showCount={true}
                        onClick={() => setIsCommentsOpen(true)}
                    />
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
                        albumName={albumDetail.title || ' '}
                        handleDelete={handleDeleteAlbum} // ✅ 새로운 mutation 사용
                        //isDeleting={deleteAlbumMutation.isPending} // 로딩 상태 전달
                    />
                )}
            </Modal>
        </>
    )
}

export default Album
