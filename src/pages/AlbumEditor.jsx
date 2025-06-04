import AlbumTitleForm from '@/components/AlbumEditor/AlbumTitleForm'
import Grid from '@/components/common/Grid'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import CreateAlbumButton from '../components/AlbumEditor/CreateAlbumButton'

// 커스텀 컴포넌트와 훅
import Input from '../components/AlbumEditor/Input' // 수정된 Input 컴포넌트
import useFileUpload from '../hooks/useFileUpload'
import { validateImageFiles } from '../services/validateImageFile'

// Assets
import { FilePreview } from '../components/AlbumEditor/\bFilePreview'
import AlbumEditorHeader from '../components/AlbumEditor/AlbumEditorHeader'
import { Alert } from '../components/AlbumEditor/Alert'
import { useAlbumCreation } from '../hooks/useAlbumCreation'
import { useAlbumTitle } from '../hooks/useAlbumTitle'

const AlbumEditor = () => {
    const { albumId } = useParams()

    const [customError, setCustomError] = useState(null)

    const { albumTitle, handleTitleChange } = useAlbumTitle()
    const { loading, error: albumError, createAlbumWithFiles, setError: setAlbumError } = useAlbumCreation()
    const {
        files,
        addFile,
        removeFile,
        error: fileError,
        overflowFiles,
        addOverflowFiles,
        isProcessing,
        setProcessing,
        isFull,
        count,
        maxFiles,
    } = useFileUpload({ maxFiles: 30 })

    // 오류 처리 핸들러
    const handleError = useCallback(errorMessage => {
        setCustomError(errorMessage)
    }, [])

    // 파일 추가 핸들러
    const handleFileAdded = useCallback(
        newFiles => {
            // 배열이 아닌 경우 배열로 변환
            const filesToProcess = Array.isArray(newFiles) ? newFiles : [newFiles]

            // 먼저 기본적인 파일 유효성 검사 진행 (크기, 형식)
            const validationResult = validateImageFiles(filesToProcess)

            if (!validationResult.isValid) {
                setCustomError(validationResult.error)
                return
            }

            // 검증된 파일을 useFileUpload에 추가 (개수 제한은 useFileUpload에서 처리)
            setCustomError(null)
            addFile(filesToProcess)
        },
        [addFile]
    )

    const handleCreateAlbum = useCallback(async () => {
        if (files.length === 0 || loading || isProcessing) return

        // 앨범 생성 로직을 훅에 위임
        await createAlbumWithFiles(albumTitle, files, albumId)
    }, [albumTitle, files, albumId, createAlbumWithFiles, loading, isProcessing])

    // 초과 파일 추가 핸들러
    const handleAddOverflowFiles = useCallback(() => {
        addOverflowFiles()
    }, [addOverflowFiles])

    // 그리드 아이템 생성
    const gridItems = useMemo(
        () => [
            {
                ElementType: () => (
                    <Input
                        onFileSelect={handleFileAdded}
                        disabled={isFull}
                        setProcessing={setProcessing}
                        isProcessing={isProcessing}
                        onError={handleError}
                    />
                ),
                element: 0,
            },
            ...files.map((fileItem, index) => ({
                ElementType: () => <FilePreview file={fileItem} onDelete={removeFile} />,
                element: index + 1,
            })),
        ],
        [files, handleFileAdded, removeFile, isFull, isProcessing, setProcessing, handleError]
    )

    // 버튼 비활성화 여부를 useMemo로 감싸기
    const isButtonDisabled = useMemo(() => {
        return albumTitle.trim() === '' || files.length === 0 || loading || isProcessing
    }, [albumTitle, files.length, loading, isProcessing])

    return (
        <div className='flex flex-col min-h-screen'>
            <AlbumEditorHeader />

            {/* 앨범 제목 폼 */}
            <AlbumTitleForm initialTitle={albumTitle} onTitleChange={handleTitleChange} />

            {/* 메인 콘텐츠 */}
            <main className='flex-grow px-4'>
                {/* 로딩 인디케이터 */}
                {isProcessing && (
                    <div className='my-2 text-center text-blue-600'>
                        이미지 파일 처리 중... HEIC 변환은 시간이 더 소요될 수 있습니다.
                    </div>
                )}

                <div className='flex items-center justify-between my-4'>
                    <span className={count === maxFiles ? 'text-red-500 font-bold' : ''}>
                        현재 {count}장 업로드 중. (최대 {maxFiles}장)
                    </span>
                </div>

                {/* 이미지 그리드 */}
                <Grid items={gridItems} />
            </main>

            <div className='mb-12'>
                {/* 오류 메시지 표시 */}
                {customError && <Alert message={customError} onAction={() => setCustomError(null)} actionText='닫기' />}

                {/* 파일 업로드 오류 표시 */}
                {fileError && <Alert message={fileError} onAction={() => setCustomError(null)} actionText='닫기' />}
            </div>
            {/* 푸터 (앨범 생성 버튼) */}
            <footer className='px-4 py-3 mt-auto'>
                <CreateAlbumButton disabled={isButtonDisabled} onClick={handleCreateAlbum}>
                    {loading ? '생성 중...' : '앨범 생성'}
                </CreateAlbumButton>

                {/* 로딩 인디케이터 */}
                {loading && (
                    <div className='mt-2 text-center text-gray-600'>이미지 업로드 중입니다. 잠시만 기다려주세요...</div>
                )}
            </footer>
        </div>
    )
}

export default AlbumEditor
