import { memo, useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

// Components
import AlbumTitleForm from '@/components/AlbumEditor/AlbumTitleForm'
import FileManager from '@/components/AlbumEditor/FileManager'
import AlbumEditorHeader from '../components/AlbumEditor/AlbumEditorHeader'
import CreateAlbumButton from '../components/AlbumEditor/CreateAlbumButton'

// Hooks
import useFileUpload from '@/hooks/useFileUpload'
import { useAlbumCreation } from '../hooks/useAlbumCreation'

// Types
import { FileItem } from '@/types/upload'

interface ButtonState {
    isAlbumTitleValid: boolean
    isFileUploadValid: boolean
    isLoading: boolean
    isProcessing: boolean
}
const MemoizedAlbumEditorHeader = memo(AlbumEditorHeader)

/**
 * 앨범 편집 컴포넌트
 * 새 앨범 생성 또는 기존 앨범에 사진 추가 기능 제공
 */
const AlbumEditor = () => {
    const [albumTitle, setAlbumTitle] = useState('이름 없는 앨범')
    const { albumId } = useParams()

    const albumData = useAlbumCreation()
    const fileManager = useFileUpload({ maxFiles: 30 })

    const handleTitleChange = useCallback((newTitle: string) => {
        setAlbumTitle(newTitle)
    }, [])

    /**
     * 앨범 생성 핸들러
     */
    const handleCreateAlbum = useCallback(async (): Promise<void> => {
        // 생성 조건 검사 (1장 이상으로 변경)
        if (fileManager.files.length < 1 || albumData.loading || fileManager.isProcessing) {
            return
        }

        try {
            await albumData.createAlbumWithFiles(albumTitle, fileManager.files, albumId as string)
        } catch (error) {
            console.error('앨범 생성 중 오류:', error)
        }
    }, [fileManager.files, albumData.loading, fileManager.isProcessing, albumTitle, albumId])

    /**
     * 파일 변환 핸들러
     */
    const handleFileConverted = useCallback(
        async (originalFile: File, convertedFile: File) => {
            try {
                // files 배열에서 원본 파일 찾기
                const originalFileItem = fileManager.files?.find(
                    fileItem =>
                        fileItem.file === originalFile ||
                        (fileItem.file.name === originalFile.name &&
                            fileItem.file.size === originalFile.size &&
                            fileItem.file.lastModified === originalFile.lastModified)
                )

                if (!originalFileItem) {
                    console.error('원본 파일을 찾을 수 없음:', originalFile.name)
                    return
                }
                const updateData: Partial<FileItem> = {
                    file: convertedFile,
                    preview: URL.createObjectURL(convertedFile),
                    isProcessed: true,
                    GPS: originalFileItem.GPS,
                }

                fileManager.updateFile(originalFileItem.id, updateData)
            } catch (error) {
                console.error('파일 교체 중 오류:', error)
            }
        },
        [fileManager.files, fileManager.updateFile]
    )

    /**
     * 버튼 비활성화 여부
     */
    const isButtonDisabled = useMemo((): ButtonState => {
        // 제목이 비어있거나, 파일이 1장 미만이거나, 로딩 중이거나, 처리 중일 때 비활성화
        console.log(
            albumTitle.trim() !== '',
            fileManager.files.length >= 1,
            albumData.loading,
            fileManager.isProcessing
        )
        return {
            isAlbumTitleValid: albumTitle.trim() !== '',
            isFileUploadValid: fileManager.files.length >= 1,
            isLoading: albumData.loading,
            isProcessing: fileManager.isProcessing,
        }
    }, [albumTitle, fileManager.files.length, albumData.loading, fileManager.isProcessing])

    return (
        <div className='flex flex-col min-h-screen'>
            <MemoizedAlbumEditorHeader title={albumId ? '사진 추가' : '앨범 생성'} />

            {/* 앨범 제목 폼 */}
            {albumId ? ' ' : <AlbumTitleForm value={albumTitle} onChange={handleTitleChange} />}

            {/* 메인 콘텐츠 */}
            <main className='flex-grow px-4'>
                <FileManager
                    files={fileManager.files}
                    onFileDelete={fileManager.removeFile}
                    onFileAdd={fileManager.addFile}
                    onFileConverted={handleFileConverted}
                    isProcessing={fileManager.isProcessing}
                    maxFiles={30}
                />
            </main>

            <footer className='px-4 py-3 mt-auto'>
                <CreateAlbumButton buttonState={isButtonDisabled} onClick={handleCreateAlbum}></CreateAlbumButton>
            </footer>
        </div>
    )
}

AlbumEditor.displayName = 'AlbumEditor'

export default AlbumEditor
