// components/AlbumEditor/FileInputButton.jsx
import { useRef } from 'react'

const FileInputButton = ({
    onFileSelect,
    disabled = false,
    maxFiles = 30,
    currentCount = 0,
    className = '',
}) => {
    const fileInputRef = useRef(null)

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click()
        }
    }

    const handleFileChange = event => {
        const files = Array.from(event.target.files)
        if (files.length > 0) {
            onFileSelect(files)
        }
        // input 초기화 (같은 파일 재선택 가능하도록)
        event.target.value = ''
    }

    const remainingSlots = Math.max(0, maxFiles - currentCount)
    const isAtLimit = currentCount >= maxFiles

    return (
        <div className={`w-full h-full ${className}`}>
            <div
                className={`
          flex flex-col items-center justify-center w-full h-full text-2xl 
          border border-gray-300 border-dashed cursor-pointer
          ${
              disabled || isAtLimit
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-50'
          }
        `}
                onClick={handleClick}
            >
                <div className='mb-2'>+</div>
                {isAtLimit ? (
                    <div className='text-xs text-center text-red-500'>
                        최대 {maxFiles}장
                    </div>
                ) : (
                    <div className='text-xs text-center text-gray-600'>
                        {remainingSlots}장 더 추가 가능
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type='file'
                className='hidden'
                accept='image/jpg,image/png,image/jpeg,image/heic,image/heif,image/gif'
                multiple
                onChange={handleFileChange}
                disabled={disabled || isAtLimit}
            />
        </div>
    )
}

export default FileInputButton
