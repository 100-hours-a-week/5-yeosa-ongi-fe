import CollapsibleContainer from '@/components/common/CollapsibleContainer'
import { ALBUM_TITLE_VALIDATION_MESSAGE } from '@/constants/validation'
import { useToast } from '@/contexts/ToastContext'
import { fileSelectors, useFileCount, useFileProcessing, useFileStore } from '@/stores/fileStore'
import { memo, useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    AlbumEditorHeader,
    AlbumTitleForm,
    CreateAlbumButton,
    FileManager,
    TagContainer,
} from '../components/AlbumEditor'
import { useAlbumCreation } from '../hooks/useAlbumCreation'

interface ButtonState {
    isAlbumTitleValid: boolean
    isFileUploadValid: boolean
    isLoading: boolean
    isProcessing: boolean
}
const MemoizedAlbumEditorHeader = memo(AlbumEditorHeader)
const MemoizedAlbumTitleForm = memo(AlbumTitleForm)
const MemoizedFileManager = memo(FileManager)
const MemoizedCreateAlbumButton = memo(CreateAlbumButton)

/**
 * 앨범 편집 컴포넌트
 * 새 앨범 생성 또는 기존 앨범에 사진 추가 기능 제공
 */
const AlbumEditor = () => {
    const [albumTitle, setAlbumTitle] = useState<string>(ALBUM_TITLE_VALIDATION_MESSAGE.UNTITLED_ALBUM)
    const { albumId } = useParams()
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const albumData = useAlbumCreation()
    const { error: errorToast } = useToast()
    const { count, isValid: isFileValid } = useFileCount()
    const files = useFileStore(fileSelectors.files)
    const { isProcessing } = useFileProcessing()

    const handleTitleChange = useCallback((newTitle: string) => {
        setAlbumTitle(newTitle)
    }, [])

    /**
     * 앨범 생성 핸들러
     */
    const handleCreateAlbum = useCallback(async (): Promise<void> => {
        if (files.length < 1 || albumData.loading || isProcessing) {
            return
        }
        try {
            await albumData.createAlbumWithFiles(albumTitle, files, albumId as string, selectedTags)
        } catch (error) {
            console.error('앨범 생성 중 오류:', error)
            errorToast(error as string)
        }
    }, [files, albumData.loading, isProcessing, albumTitle, albumId])

    /**
     * 버튼 비활성화 여부
     */

    const buttonState = useMemo(
        (): ButtonState => ({
            isAlbumTitleValid: albumTitle.trim() !== '',
            isFileUploadValid: isFileValid,
            isLoading: albumData.loading,
            isProcessing: isProcessing,
        }),
        [albumTitle, albumData.loading, isProcessing, isFileValid]
    )

    const handleTagsChange = (newTags: string[]) => {
        setSelectedTags(newTags)
        console.log('선택된 태그들:', newTags)
    }

    return (
        <div className='flex flex-col min-h-screen'>
            <MemoizedAlbumEditorHeader title={albumId ? '사진 추가' : '앨범 생성'} />

            {/* 앨범 제목 폼 */}
            {albumId ? ' ' : <MemoizedAlbumTitleForm value={albumTitle} onChange={handleTitleChange} />}

            {albumId ? (
                ' '
            ) : (
                <>
                    <CollapsibleContainer title='태그 선택' defaultExpanded={true}>
                        <TagContainer activeTags={selectedTags} onTagChange={handleTagsChange}></TagContainer>
                    </CollapsibleContainer>
                </>
            )}

            {/* 메인 콘텐츠 */}
            <main className='flex-grow px-4'>
                <FileManager />
            </main>

            <footer className='px-4 py-3 mt-auto'>
                <CreateAlbumButton buttonState={buttonState} onClick={handleCreateAlbum}></CreateAlbumButton>
            </footer>
        </div>
    )
}

AlbumEditor.displayName = 'AlbumEditor'

export default AlbumEditor
