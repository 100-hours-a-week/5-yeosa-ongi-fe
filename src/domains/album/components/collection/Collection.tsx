import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// APIs
import { useDeleteAlbumPictures, useRecoverAlbumPictures } from '@/queries/album/mutations'
import useModal from '@/shared/hooks/useModal'
import useCollectionStore from '../../stores/collectionStore'

// Components
import ConfirmModal from '@/shared/components/ConfirmModal'
import { GridItemConfig, GridWithChildren } from '@/shared/components/GridWithChildren'
import Header from '@/shared/components/Header'
import Icon from '@/shared/components/Icon'
import { Modal } from '@/shared/components/Modal'
import MovingDotsLoader from '@/shared/components/MovingDotsLoader'
import OptimizedImage from '@/shared/components/OptimizedImage'
import CollectionHeader from './CollectionHeader'
import ImageModal from './ImageModal'

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

interface PictureItemProps {
    picture: Picture
    index: number
    isSelectMode: boolean
    isSelected: boolean
    onToggleSelect: (pictureId: string) => void
    onImageClick: (index: number) => void
}

// PictureItem을 별도 컴포넌트로 분리하고 memo로 최적화
const PictureItem = memo(
    ({ picture, index, isSelectMode, isSelected, onToggleSelect, onImageClick }: PictureItemProps) => {
        const [localSelected, setLocalSelected] = useState(isSelected)
        const checkboxRef = useRef<HTMLDivElement>(null)

        // isSelected prop이 변경되면 로컬 상태도 업데이트
        useEffect(() => {
            setLocalSelected(isSelected)
        }, [isSelected])

        // 클릭 핸들러들을 useCallback으로 최적화
        const handleSelectClick = useCallback(
            (e: React.MouseEvent) => {
                e.stopPropagation()
                if (isSelectMode) {
                    // 즉시 UI 업데이트 (낙관적 업데이트)
                    setLocalSelected(prev => !prev)

                    // DOM 직접 조작으로 체크박스 상태 즉시 반영
                    if (checkboxRef.current) {
                        const newSelected = !localSelected
                        checkboxRef.current.className = `w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            newSelected ? 'bg-primary' : 'border-gray-light bg-transparent'
                        }`
                        const checkmark = checkboxRef.current.querySelector('span')
                        if (newSelected && !checkmark) {
                            checkboxRef.current.innerHTML = '<span class="text-xs text-white">✓</span>'
                        } else if (!newSelected && checkmark) {
                            checkboxRef.current.innerHTML = ''
                        }
                    }

                    // 부모 상태는 비동기적으로 업데이트
                    setTimeout(() => {
                        onToggleSelect(picture.pictureId)
                    }, 0)
                }
            },
            [isSelectMode, onToggleSelect, picture.pictureId, localSelected]
        )

        const handleImageClick = useCallback(
            (e: React.MouseEvent) => {
                e.stopPropagation()
                if (!isSelectMode) {
                    onImageClick(index)
                }
            },
            [isSelectMode, onImageClick, index]
        )

        // 체크박스 클래스를 useMemo로 최적화 (로컬 상태 기반)
        const checkboxClasses = useMemo(() => {
            return `w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                localSelected ? 'bg-primary' : 'border-gray-light bg-transparent'
            }`
        }, [localSelected])

        return (
            <div className='relative w-full h-full'>
                <div onClick={handleImageClick} className='cursor-pointer'>
                    <OptimizedImage src={picture.pictureURL} alt={`Photo ${picture.pictureId}`} size='thumbnail' />
                </div>

                {isSelectMode && (
                    <div className='absolute z-10 cursor-pointer top-2 right-2' onClick={handleSelectClick}>
                        <div ref={checkboxRef} className={checkboxClasses}>
                            {localSelected && <span className='text-xs text-white'>✓</span>}
                        </div>
                    </div>
                )}
            </div>
        )
    },
    (prevProps, nextProps) => {
        // 더 세밀한 props 비교로 불필요한 리렌더링 방지
        return (
            prevProps.picture.pictureId === nextProps.picture.pictureId &&
            prevProps.isSelectMode === nextProps.isSelectMode &&
            prevProps.index === nextProps.index
            // isSelected는 로컬 상태로 관리하므로 비교에서 제외
        )
    }
)

PictureItem.displayName = 'PictureItem'

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

    // 성공 핸들러들을 useCallback으로 최적화
    const handleDeleteSuccess = useCallback(() => {
        console.log('사진 삭제 성공')
        const pictureIds = Array.from(selectedPictures)
        removePictures(pictureIds)

        if (!collectionName) return

        const updatedCollection = getCollectionByName(collectionName)
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
    }, [selectedPictures, collectionName, getCollectionByName, removePictures, navigate, albumId])

    const handleRecoverSuccess = useCallback(() => {
        console.log('사진 복원 성공')
        const pictureIds = Array.from(selectedPictures)
        recoverPictures(pictureIds)

        if (!collectionName) return

        const updatedCollection = getCollectionByName(collectionName)
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
    }, [selectedPictures, collectionName, getCollectionByName, recoverPictures, navigate, albumId])

    const deleteAlbumPictures = useDeleteAlbumPictures({
        onSuccess: handleDeleteSuccess,
    })

    const recoverAlbumPictures = useRecoverAlbumPictures({
        onSuccess: handleRecoverSuccess,
    })

    // 이벤트 핸들러들을 useCallback으로 최적화
    const toggleSelect = useCallback((pictureId: string): void => {
        setSelectedPictures(prev => {
            const newSelected = new Set(prev)
            if (newSelected.has(pictureId)) {
                newSelected.delete(pictureId)
            } else {
                newSelected.add(pictureId)
            }
            return newSelected
        })
    }, [])

    const handleImageClick = useCallback(
        (index: number): void => {
            console.log('이미지 클릭')
            openImageModal(index)
        },
        [openImageModal]
    )

    const handleClick = useCallback((): void => {
        if (selectedPictures.size === 0) {
            setIsSelectMode(false)
            return
        }
        openModal('사진 삭제')
    }, [selectedPictures.size, openModal])

    const handleRecoverClick = useCallback((): void => {
        console.log('복원 모달 온')
        if (selectedPictures.size === 0) {
            setIsSelectMode(false)
            return
        }
        openModal('사진 복원')
    }, [selectedPictures.size, openModal])

    const handleDelete = useCallback(async (): Promise<void> => {
        if (!albumId) return

        const pictureIds = Array.from(selectedPictures)
        console.log(pictureIds)
        deleteAlbumPictures.mutate({
            albumId,
            pictureIds,
        })
        closeModal()
    }, [albumId, selectedPictures, deleteAlbumPictures, closeModal])

    const handleRecover = useCallback(async (): Promise<void> => {
        if (!albumId) return

        const pictureIds = Array.from(selectedPictures)
        recoverAlbumPictures.mutate({
            albumId,
            pictureIds,
        })
        closeModal()
    }, [albumId, selectedPictures, recoverAlbumPictures, closeModal])

    const handleGoBack = useCallback(() => {
        navigate(-1)
    }, [navigate])

    // 계산값들을 useMemo로 최적화
    const pictures: Picture[] = useMemo(() => {
        return currentCollection?.pictures || []
    }, [currentCollection?.pictures])

    const isCollectionShaky = useMemo((): boolean => {
        return collectionName === '흔들림' || collectionName === '중복'
    }, [collectionName])

    const displayTitle = useMemo(() => {
        return currentCollection?.alt || currentCollection?.name || '컬렉션'
    }, [currentCollection?.alt, currentCollection?.name])

    const hasButtons = useMemo(() => {
        return !currentCollection?.alt
    }, [currentCollection?.alt])

    // gridItems를 useMemo로 최적화 - selectedPictures 의존성 제거
    const gridItems: GridItemConfig[] = useMemo(() => {
        return pictures.map((picture, index) => ({
            id: picture.pictureId,
            component: PictureItem,
            props: {
                picture,
                index,
                isSelectMode,
                isSelected: selectedPictures.has(picture.pictureId), // 초기값만 설정
                onToggleSelect: toggleSelect,
                onImageClick: handleImageClick,
            },
        }))
    }, [pictures, isSelectMode, toggleSelect, handleImageClick]) // selectedPictures 제거

    // 모달 콘텐츠를 useMemo로 최적화
    const deleteModalContent = useMemo(
        () => [`선택한 ${selectedPictures.size}장의 사진을 삭제하시겠습니까?`, '삭제된 사진은 복구할 수 없습니다.'],
        [selectedPictures.size]
    )

    const recoverModalContent = useMemo(
        () => `선택한 ${selectedPictures.size}장의 사진을 복원하시겠습니까?`,
        [selectedPictures.size]
    )

    useEffect(() => {
        try {
            setLoading(true)

            if (!collectionName) {
                navigate(`/album/${albumId}`)
                return
            }

            const collection = getCollectionByName(collectionName)

            if (!collection) {
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
                <button onClick={handleGoBack} className='absolute h-1/2 left-4 top-1/4'>
                    <Icon name='arrow' className='' direction='left' />
                </button>
                <div className='text-center'>{displayTitle}</div>
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
                hasButtons={hasButtons}
            />

            <GridWithChildren col={3} items={gridItems} />

            {/* Modal */}
            {isRecovery ? (
                <Modal isOpen={isOpen} onClose={closeModal} title={modalData}>
                    {modalData && (
                        <ConfirmModal
                            title={modalData}
                            content={recoverModalContent}
                            handleConfirm={handleRecover}
                            closeModal={closeModal}
                        />
                    )}
                </Modal>
            ) : (
                <Modal isOpen={isOpen} onClose={closeModal} title={modalData}>
                    {modalData && (
                        <ConfirmModal
                            title={modalData}
                            content={deleteModalContent}
                            handleConfirm={handleDelete}
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
