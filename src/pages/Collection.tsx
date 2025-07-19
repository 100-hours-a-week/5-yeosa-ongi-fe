import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// Components
import ConfirmModal from '../components/common/ConfirmModal'
import Header from '../components/common/Header'
import { Modal } from '../components/common/Modal'

// APIs

// Store
import useCollectionStore from '../stores/collectionStore'

//Hooks
import useModal from '../hooks/useModal'

// Assets
import CollectionHeader from '@/components/Collection/CollectionHeader'
import ImageModal from '@/components/Collection/ImageModal'
import { GridWithChildren } from '@/components/common/GridWithChildren'
import Icon from '@/components/common/Icon'
import MovingDotsLoader from '@/components/common/MovingDotsLoader'
import { useDeleteAlbumPictures, useRecoverAlbumPictures } from '@/queries/album/mutations'

// Types
import { GridItemConfig } from '@/components/common/GridWithChildren'
import OptimizedImage from '@/components/common/OptimizedImage'

interface Picture {
    pictureId: string
    pictureURL: string
    [key: string]: any
}

interface Collection {
    name: string
    alt?: string
    pictures: Picture[]
    [key: string]: any
}

const Collection: React.FC = () => {
    const { albumId, collectionName } = useParams<{
        albumId: string
        collectionName: string
    }>()
    const navigate = useNavigate()

    const [currentCollection, setCurrentCollection] = useState<Collection | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [isSelectMode, setIsSelectMode] = useState<boolean>(false)
    const [isRecovery, setIsRecovery] = useState<boolean>(false)
    const [selectedPictures, setSelectedPictures] = useState<Set<string>>(new Set())

    const { isOpen, modalData, openModal, closeModal } = useModal()
    const {
        isOpen: isImageModalOpen,
        modalData: imageModalData,
        openModal: openImageModal,
        closeModal: closeImageModal,
    } = useModal()

    const getCollectionByName = useCollectionStore(state => state.getCollectionByName)
    const removePictures = useCollectionStore(state => state.removePictures)
    const recoverPictures = useCollectionStore(state => state.recoverPictures)

    const deleteAlbumPictures = useDeleteAlbumPictures({
        onSuccess: () => {
            console.log('사진 삭제 성공')
            // Store 업데이트
            const pictureIds = Array.from(selectedPictures)
            removePictures(pictureIds)

            if (!collectionName) return

            const updatedCollection = getCollectionByName(collectionName)
            // 타입 가드를 사용하여 안전하게 처리
            if (updatedCollection && 'pictures' in updatedCollection) {
                setCurrentCollection(updatedCollection as Collection)

                if (updatedCollection.pictures.length === 0) {
                    navigate(`/album/${albumId}`)
                }
            } else {
                navigate(`/album/${albumId}`)
            }

            setIsSelectMode(false)
            setSelectedPictures(new Set())
        },
    })

    const recoverAlbumPictures = useRecoverAlbumPictures({
        onSuccess: () => {
            console.log('사진 복원 성공')
            // Store 업데이트
            const pictureIds = Array.from(selectedPictures)
            recoverPictures(pictureIds)

            if (!collectionName) return

            const updatedCollection = getCollectionByName(collectionName)
            // 타입 가드를 사용하여 안전하게 처리
            if (updatedCollection && 'pictures' in updatedCollection) {
                setCurrentCollection(updatedCollection as Collection)

                if (updatedCollection.pictures.length === 0) {
                    navigate(`/album/${albumId}`)
                }
            } else {
                navigate(`/album/${albumId}`)
            }

            setIsSelectMode(false)
            setIsRecovery(false)
            setSelectedPictures(new Set())
        },
    })

    const toggleSelect = (pictureId: string): void => {
        setSelectedPictures(prev => {
            const newSelected = new Set(prev)
            if (newSelected.has(pictureId)) {
                newSelected.delete(pictureId)
            } else {
                newSelected.add(pictureId)
            }
            return newSelected
        })
    }

    // 로딩 중이거나 currentCollection이 없으면 빈 배열 사용
    const pictures: Picture[] = currentCollection?.pictures || []

    // PictureItem 컴포넌트
    const PictureItem: React.FC<{
        picture: Picture
        index: number
        isSelectMode: boolean
        isSelected: boolean
        onToggleSelect: (pictureId: string) => void
        onImageClick: (index: number) => void
    }> = ({ picture, index, isSelectMode, isSelected, onToggleSelect, onImageClick }) => {
        return (
            <div className='relative w-full h-full' onClick={() => isSelectMode && onToggleSelect(picture.pictureId)}>
                <div onClick={() => onImageClick(index)}>
                    <OptimizedImage src={picture.pictureURL} alt={`Photo ${picture.pictureId}`} size='thumbnail' />
                </div>
                {isSelectMode && (
                    <div className='absolute z-10 top-2 right-2'>
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'bg-primary' : 'border-gray-light bg-transparent'
                            }`}
                        >
                            {isSelected && <span className='text-xs text-white'>✓</span>}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const handleImageClick = (index: number): void => {
        console.log('이미지 클릭')
        openImageModal(index)
    }

    // 개선된 items 방식으로 변경
    const gridItems: GridItemConfig[] = pictures.map((picture, index) => ({
        id: picture.pictureId,
        component: PictureItem,
        props: {
            picture,
            index,
            isSelectMode,
            isSelected: selectedPictures.has(picture.pictureId),
            onToggleSelect: toggleSelect,
            onImageClick: handleImageClick,
        },
    }))

    const isCollectionShaky = (): boolean => {
        if (collectionName === '흔들림' || collectionName === '중복') {
            return true
        }
        return false
    }

    const handleClick = (): void => {
        if (selectedPictures.size === 0) {
            setIsSelectMode(false)
            return
        }
        openModal('사진 삭제')
    }

    const handleRecoverClick = (): void => {
        console.log('복원 모달 온')
        if (selectedPictures.size === 0) {
            setIsSelectMode(false)
            return
        }
        openModal('사진 복원')
    }

    /**
     * 사진 삭제 핸들러 - 현재 시스템의 훅 사용
     */
    const handleDelete = async (): Promise<void> => {
        if (!albumId) return

        const pictureIds = Array.from(selectedPictures)
        console.log(pictureIds)
        deleteAlbumPictures.mutate({
            albumId,
            pictureIds,
        })
        closeModal()
    }

    /**
     * 사진 복원 핸들러 - 현재 시스템의 훅 사용
     */
    const handleRecover = async (): Promise<void> => {
        if (!albumId) return

        const pictureIds = Array.from(selectedPictures)
        recoverAlbumPictures.mutate({
            albumId,
            pictureIds,
        })
        closeModal()
    }

    useEffect(() => {
        try {
            setLoading(true)

            if (!collectionName) {
                navigate(`/album/${albumId}`)
                return
            }

            const collection = getCollectionByName(collectionName)

            if (!collection) {
                // 컬렉션이 없는 경우 앨범 페이지로 리다이렉트
                navigate(`/album/${albumId}`)
                return
            }

            setCurrentCollection(collection as Collection)
            setLoading(false)
        } catch (error) {
            navigate(`/album/${albumId}`)
            console.log(error)
        }
    }, [collectionName, albumId, navigate, getCollectionByName])

    if (loading || !currentCollection) {
        console.log('Loading, currentCollection:', currentCollection)
        return (
            <>
                <Header />
                <MovingDotsLoader />
            </>
        )
    }

    return (
        <>
            <div className='h-[52px] relative flex items-center justify-center'>
                <button onClick={() => navigate(-1)} className='absolute h-1/2 left-4 top-1/4'>
                    <Icon name='arrow' className='' direction='left' />
                </button>
                <div className='text-center'>{currentCollection?.alt || currentCollection?.name || '컬렉션'}</div>
            </div>

            <CollectionHeader
                currentCollection={currentCollection}
                pictures={pictures}
                isSelectMode={isSelectMode}
                isRecovery={isRecovery}
                selectedPictures={selectedPictures}
                setIsSelectMode={setIsSelectMode}
                setIsRecovery={setIsRecovery}
                handleClick={handleClick}
                handleRecoverClick={handleRecoverClick}
                isCollectionShaky={isCollectionShaky}
                hasButtons={currentCollection.alt ? false : true}
            />

            <GridWithChildren col={3} items={gridItems} />

            {/* Modal */}
            {isRecovery ? (
                <Modal isOpen={isOpen} onClose={closeModal} title={modalData}>
                    {modalData && (
                        <ConfirmModal
                            title={modalData}
                            content={`선택한 ${selectedPictures.size}장의 사진을 복원하시겠습니까?`}
                            handleConfirm={() => handleRecover()}
                            closeModal={closeModal}
                        />
                    )}
                </Modal>
            ) : (
                <Modal isOpen={isOpen} onClose={closeModal} title={modalData}>
                    {modalData && (
                        <ConfirmModal
                            title={modalData}
                            content={[
                                `선택한 ${selectedPictures.size}장의 사진을 삭제하시겠습니까?`,
                                '삭제된 사진은 복구할 수 없습니다.',
                            ]}
                            handleConfirm={() => handleDelete()}
                            closeModal={closeModal}
                        />
                    )}
                </Modal>
            )}
            <Modal isOpen={isImageModalOpen} onClose={closeImageModal} title={imageModalData}>
                <ImageModal idx={imageModalData} pictures={pictures} />
            </Modal>
        </>
    )
}

export default Collection
