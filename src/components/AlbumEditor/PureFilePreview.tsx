// components/FilePreview/PureFilePreview.tsx (새 파일)
import crossIcon from '@/assets/cross_icon.png'
import ConversionOverlay from './ConversionOverlay'
import ErrorOverlay from './ErrorOverlay'

interface PureFilePreviewProps {
    previewUrl: string
    fileName: string
    fileType: string
    isConverting: boolean
    conversionError: string | null
    onDelete: () => void
    onImageError?: () => void
    onImageLoad?: () => void
}

const PureFilePreview = ({
    previewUrl,
    fileName,
    fileType,
    isConverting,
    conversionError,
    onDelete,
    onImageError,
    onImageLoad,
}: PureFilePreviewProps) => {
    return (
        <div className='relative w-full h-full'>
            {/* 메인 이미지 또는 로딩 상태 */}
            {previewUrl ? (
                <img
                    src={previewUrl}
                    alt={fileName}
                    className='absolute inset-0 object-cover w-full h-full'
                    onError={onImageError}
                    onLoad={onImageLoad}
                />
            ) : (
                <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
                    <span className='text-gray-400'>미리보기 준비 중...</span>
                </div>
            )}

            {/* 삭제 버튼 */}
            <button className='absolute z-10 top-2 right-2' onClick={onDelete} disabled={isConverting}>
                <img className='w-4 h-4' src={crossIcon} alt='삭제' />
            </button>

            {/* 변환 중 오버레이 */}
            {isConverting && <ConversionOverlay />}

            {/* 에러 오버레이 */}
            {conversionError && <ErrorOverlay message={conversionError} />}

            {/* 파일 형식 표시 디버깅 용*/}
            <div className='absolute top-2 left-2'>
                <span className='px-1 py-0.5 text-xs text-white bg-black bg-opacity-50 rounded'>{fileType}</span>
            </div>
        </div>
    )
}

export default PureFilePreview
