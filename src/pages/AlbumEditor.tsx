// AlbumEditor.tsx (파일 교체 지원 최종 버전)

import AlbumTitleForm from '@/components/AlbumEditor/AlbumTitleForm'
import { FC, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import CreateAlbumButton from '../components/AlbumEditor/CreateAlbumButton'

// 커스텀 컴포넌트와 훅
import FileManager from '@/components/AlbumEditor/FileManager'
import { useAlbumCreationUI } from '@/hooks/useAlbumCreationUI'
import useFileUpload from '@/hooks/useFileUpload'
import { FileItem } from '@/types/upload'
import AlbumEditorHeader from '../components/AlbumEditor/AlbumEditorHeader'
import { useAlbumCreation } from '../hooks/useAlbumCreation'
// import { useAlbumTitle } from '../hooks/useAlbumTitle'

const AlbumEditor: FC = () => {
    const { albumId } = useParams<{ albumId?: string }>()

    const { loading, error: albumError, createAlbumWithFiles } = useAlbumCreation()

    // 통합된 파일 관리
    const fileManager = useFileUpload({ maxFiles: 30 })

    // 앨범 UI 로직
    const albumUI = useAlbumCreationUI({
        files: fileManager.files,
        isProcessing: fileManager.isProcessing,
        albumId,
    })

    // 파일 변환 완료 핸들러 (메타데이터 보존하면서 파일만 교체)
    const handleFileConverted = useCallback(
        async (originalFile: File, convertedFile: File) => {
            console.log(
                '파일 변환 완료, 원본 메타데이터 보존하면서 파일 교체:',
                originalFile.name,
                '→',
                convertedFile.name
            )

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

                console.log('원본 파일 발견:', originalFileItem.id, originalFileItem.file.name)
                console.log('보존할 GPS 정보:', originalFileItem.GPS)

                // 파일만 교체하고 메타데이터는 원본 것을 보존
                const updateData: Partial<FileItem> = {
                    file: convertedFile,
                    preview: URL.createObjectURL(convertedFile),
                    isProcessed: true,
                    // 원본에서 추출한 GPS 정보 보존
                    GPS: originalFileItem.GPS,
                }

                fileManager.updateFile(originalFileItem.id, updateData)

                console.log('파일 교체 완료 (메타데이터 보존):', convertedFile.name, 'Type:', convertedFile.type)
                console.log('보존된 GPS 정보:', updateData.GPS)
            } catch (error) {
                console.error('파일 교체 중 오류:', error)
            }
        },
        [fileManager]
    )

    return (
        <div className='flex flex-col min-h-screen'>
            <AlbumEditorHeader title={albumId ? '사진 추가' : '앨범 생성'} />

            {/* 앨범 제목 폼 */}
            {albumId ? (
                ' '
            ) : (
                <AlbumTitleForm initialTitle={albumUI.albumTitle} onTitleChange={albumUI.handleTitleChange} />
            )}

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

            {/* 푸터 (앨범 생성 버튼) */}
            <footer className='px-4 py-3 mt-auto'>
                <CreateAlbumButton
                    disabled={albumUI.isButtonDisabled}
                    onClick={albumUI.handleCreateAlbum}
                    description={albumId ? '사진 추가 ' : '앨범 생성'}
                >
                    {loading ? '생성 중...' : ' '}
                </CreateAlbumButton>

                {/* 로딩 인디케이터 */}
                {loading && (
                    <div className='mt-2 text-center text-gray-600'>이미지 업로드 중입니다. 잠시만 기다려주세요...</div>
                )}

                {/* 에러 표시 */}
                {albumError && <div className='mt-2 text-center text-red-600'>에러: {albumError}</div>}
            </footer>
        </div>
    )
}

AlbumEditor.displayName = 'AlbumEditor'

export default AlbumEditor
