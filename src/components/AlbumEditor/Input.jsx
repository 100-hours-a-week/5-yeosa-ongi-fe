import { validateFileCount, validateImageFiles } from '@/services/validateImageFile'
import { useRef } from 'react'

const Input = ({ onFileSelect, disabled = false, setProcessing, isProcessing = false, onError, currentFiles = [] }) => {
    const fileInputRef = useRef(null)

    const handleFileChange = async e => {
        const selectedFiles = Array.from(e.target.files)

        if (selectedFiles.length === 0) {
            e.target.value = ''
            return
        }
        console.log(selectedFiles)
        setProcessing(true)
        try {
            /**
             * 파일 검증 파이프라인
             */
            const totalFiles = currentFiles.length + selectedFiles.length
            const countValidation = validateFileCount(Array(totalFiles), 10)

            if (!countValidation.isValid) {
                onError(countValidation.error)
                e.target.value = ''
                return
            }

            const validationResult = validateImageFiles(selectedFiles)

            if (!validationResult.isValid) {
                onError(validationResult.error)
                e.target.value = ''
                return
            }

            const validFiles = validationResult.validFiles
            console.log('검증 통과한 파일들:', validFiles)

            if (validFiles.length === 1) {
                onFileSelect(validFiles[0])
            } else {
                onFileSelect(validFiles)
            }
        } catch (error) {
            console.error('파일 처리 중 오류 발생:', error)
            onError('파일 처리 중 오류가 발생했습니다.')
        } finally {
            setProcessing(false)
            e.target.value = ''
        }
    }

    const handleClick = () => {
        if (!isProcessing) {
            if (disabled) {
                onError(`사진은 최대 30장 선택할 수 있습니다.`)
                return
            }
            fileInputRef.current.click()
        }
    }

    return (
        <div className='w-full h-full'>
            <div
                className='flex items-center justify-center w-full h-full text-2xl bg-white border border-gray-300 border-dashed cursor-pointer'
                onClick={handleClick}
            >
                +
            </div>
            <input
                ref={fileInputRef}
                className='hidden'
                type='file'
                accept='image/jpg, image/png, image/jpeg, image/heic'
                multiple
                onChange={handleFileChange}
            />
        </div>
    )
}

export default Input
