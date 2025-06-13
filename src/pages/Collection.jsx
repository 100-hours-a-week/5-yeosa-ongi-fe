import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// Components
import ConfirmModal from '../components/common/ConfirmModal'
import Grid from '../components/common/Grid'
import Header from '../components/common/Header'
import { Modal } from '../components/common/Modal'

// APIs
import { deleteAlbumPicture } from '../api/pictures/deletePicture'
import { recoverAlbumPicture } from '../api/pictures/recoverPicture'

// Store
import useCollectionStore from '../stores/collectionStore'

//Hooks
import useModal from '../hooks/useModal'

// Assets
import CollectionHeader from '@/components/Collection/CollectionHeader'
import ImageModal from '@/components/Collection/ImageModal'
import MovingDotsLoader from '@/components/common/MovingDotsLoader'
import arrowLeft from '../assets/icons/Arrow_Left.png'

const Collection = () => {
    const { albumId, collectionName } = useParams()
    const navigate = useNavigate()

    const [currentCollection, setCurrentCollection] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isSelectMode, setIsSelectMode] = useState(false)
    const [isRecovery, setIsRecovery] = useState(false)
    const [selectedPictures, setSelectedPictures] = useState(new Set())
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

    const toggleSelect = pictureId => {
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
    const pictures = currentCollection?.pictures || []

    const formattedPictures = pictures.map((picture, index) => ({
        ElementType: () => {
            const isSelected = selectedPictures.has(picture.pictureId)

            return (
                <div className='relative w-full h-full' onClick={() => isSelectMode && toggleSelect(picture.pictureId)}>
                    <img
                        src={picture.pictureURL}
                        className='absolute inset-0 object-cover w-full h-full'
                        onClick={() => handleImageClick(index)}
                    />
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
        },
        element: picture,
        props: {
            alt: `Photo ${picture.pictureId || ''}`,
            className: 'w-full h-full object-cover',
        },
    }))

    const isCollectionShaky = () => {
        if (collectionName == '흔들림' || collectionName == '중복') {
            return true
        }
        return false
    }

    const handleClick = () => {
        if (selectedPictures.size === 0) {
            setIsSelectMode(false)
            return
        }
        openModal('사진 삭제')
    }

    const handleRecoverClick = () => {
        console.log('복원 모달 온')
        if (selectedPictures.size === 0) {
            setIsSelectMode(false)
            return
        }
        openModal('사진 복원')
    }

    const handleImageClick = index => {
        console.log('이미지 클릭')
        openImageModal(index)
    }

    /**
     * 사진 삭제 핸들러
     */
    const handleDelete = async () => {
        try {
            const pictureIds = Array.from(selectedPictures)

            await deleteAlbumPicture(albumId, { pictureIds })
            removePictures(pictureIds)

            const updatedCollection = getCollectionByName(collectionName)
            setCurrentCollection(updatedCollection)

            setIsSelectMode(false)
            setSelectedPictures(new Set())

            if (!updatedCollection || updatedCollection.pictures.length === 0) {
                navigate(`/album/${albumId}`)
            }
        } catch (error) {
            console.error('사진 삭제 중 오류 발생:', error)
        }
    }

    /**
     * 사진 복원 핸들러
     */
    const handleRecover = async () => {
        try {
            const pictureIds = Array.from(selectedPictures)
            await recoverAlbumPicture(albumId, { pictureIds })
            recoverPictures(pictureIds)

            // 업데이트된 컬렉션 데이터 가져오기
            const updatedCollection = getCollectionByName(collectionName)
            setCurrentCollection(updatedCollection)

            setIsSelectMode(false)
            setIsRecovery(false)
            setSelectedPictures(new Set())

            // 컬렉션이 비어있으면 앨범 페이지로 이동
            if (!updatedCollection || updatedCollection.pictures.length === 0) {
                navigate(`/album/${albumId}`)
            }
        } catch (error) {
            console.error('사진 복원 중 오류 발생:', error)
        }
    }

    useEffect(() => {
        try {
            setLoading(true)
            const collection = getCollectionByName(collectionName)

            if (!collection) {
                // 컬렉션이 없는 경우 앨범 페이지로 리다이렉트
                navigate(`/album/${albumId}`)
                return
            }

            setCurrentCollection(collection)
            setLoading(false)
        } catch (error) {
            navigate(`/album/${albumId}`)
            console.log(error)
        }
    }, [collectionName, albumId])

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
                    <img src={arrowLeft} className='h-1/2 left-4 top-1/4' alt='뒤로가기' />
                </button>
                <div className='text-center'>{currentCollection?.name || '컬렉션'}</div>
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
            />

            <Grid col={3} items={formattedPictures} />

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
