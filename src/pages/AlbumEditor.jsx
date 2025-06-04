import AlbumTitleForm from '@/components/AlbumEditor/AlbumTitleForm'
import Grid from '@/components/common/Grid'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import CreateAlbumButton from '../components/AlbumEditor/CreateAlbumButton'

// 커스텀 컴포넌트와 훅
import Input from '../components/AlbumEditor/Input' // 수정된 Input 컴포넌트
import useFileUpload from '../hooks/useFileUpload'
import { validateImageFiles } from '../services/validateImageFile'

// APIs

// Assets
import crossIcon from '../assets/cross_icon.png'
import AlbumEditorHeader from '../components/AlbumEditor/AlbumEditorHeader'
import { useAlbumCreation } from '../hooks/useAlbumCreation'
import { useAlbumTitle } from '../hooks/useAlbumTitle'

// 파일 미리보기 컴포넌트
/**
 * 새로운 컴포넌트로 분리 가능
 * @param {*} param0
 * @returns
 */
const FilePreview = ({ file, onDelete }) => (
    <div className='relative w-full h-full'>
        <img src={file.preview} alt={`Preview ${file.id}`} className='absolute inset-0 object-cover w-full h-full' />
        <button className='absolute z-10 top-2 right-2' onClick={() => onDelete(file.id)}>
            <img className='w-4 h-4' src={crossIcon} alt='삭제' />
        </button>
    </div>
)

// 알림 컴포넌트
/**
 * 꼭 있어야 할까?
 * @param {} param0
 * @returns
 */
const Alert = ({ message, type = 'error', onAction, actionText }) => {
    if (!message) return null

    const bgColor = type === 'error' ? 'bg-red-100' : 'bg-yellow-100'
    const textColor = type === 'error' ? 'text-red-800' : 'text-yellow-800'

    return (
        <div className={`p-4 mb-4 rounded-md ${bgColor} ${textColor}`}>
            <div className='flex items-center justify-between'>
                <p>{message}</p>
                {onAction && actionText && (
                    <button className='px-3 py-1 ml-4 text-sm font-medium bg-white rounded-md' onClick={onAction}>
                        {actionText}
                    </button>
                )}
            </div>
        </div>
    )
}

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
    // const handleCreateAlbum = async () => {
    //     if (files.length === 0 || loading || isProcessing) return

    //     const trimmedTitle = albumTitle.trim()
    //     if (!trimmedTitle) {
    //         setCustomError('앨범 제목을 입력해주세요.')
    //         return
    //     }

    //     setLoading(true)
    //     setCustomError(null)

    //     try {
    //         // 1. 앨범 이름과 파일 메타데이터 준비 - 각 파일에 새 이름 할당
    //         const filesWithNewNames = files.map(fileItem => {
    //             const newName = uuidv4() + '.' + fileItem.file.type.split('/')[1]
    //             return {
    //                 ...fileItem,
    //                 newName,
    //                 originalFile: fileItem.file,
    //             }
    //         })

    //         const pictures = filesWithNewNames.map(fileItem => ({
    //             pictureName: fileItem.newName,
    //             pictureType: fileItem.originalFile.type,
    //         }))

    //         console.log('생성된 pictures:', pictures)

    //         // 2. presigned URL 요청
    //         const response = await getPreSignedUrl({ pictures })
    //         const presignedFiles = response.data.presignedFiles

    //         console.log('서버에서 받은 presignedFiles:', presignedFiles)

    //         // 3. 각 파일을 presigned URL을 사용하여 업로드
    //         for (const fileItem of filesWithNewNames) {
    //             const file = fileItem.originalFile
    //             const newName = fileItem.newName

    //             const matched = presignedFiles.find(f => f.pictureName === newName)

    //             if (!matched) {
    //                 console.error(`${newName}에 대한 매칭되는 presigned URL을 찾을 수 없습니다.`)
    //                 continue
    //             }

    //             console.log(`${newName} 파일 업로드 시작...`)

    //             try {
    //                 await axios.put(matched.presignedUrl, file, {
    //                     headers: {
    //                         'Content-Type': file.type,
    //                     },
    //                 })
    //                 console.log(`${newName} 파일 업로드 완료!`)
    //             } catch (error) {
    //                 console.error(`${newName} 파일 업로드 중 오류:`, error)
    //                 throw error // 오류를 상위로 전파
    //             }
    //         }

    //         // 4. 업로드 완료 후 앨범 생성 요청
    //         // pictureUrl은 S3의 URL로 수정해야 함, presignedUrl은 업로드용이지 액세스용이 아님

    //         const pictureData = presignedFiles.map(f => ({
    //             pictureUrl: f.pictureURL || f.pictureName, // 서버 응답에 따라 적절한 필드 사용
    //             latitude: 0.0,
    //             longitude: 0.0,
    //         }))

    //         const albumData = {
    //             albumName: trimmedTitle,
    //             pictureUrls: pictureData,
    //         }

    //         console.log('생성할 앨범 데이터:', albumData)
    //         if (!albumId) {
    //             const result = await createAlbum(albumData)
    //             console.log('앨범 생성 결과:', result)
    //             navigate('/main')
    //         } else {
    //             const result = await addAlbumPicture(albumId, albumData)
    //             console.log('사진 추가 결과:', result)
    //             navigate(`/album/${albumId}`)
    //         }
    //     } catch (err) {
    //         console.error('전체 오류:', err)
    //         setCustomError('앨범 생성 중 오류가 발생했습니다.')
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    // 앨범 생성 핸들러 - 이제 단순히 훅 호출만
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
