import { validateFileCount, validateImageFiles } from '@/services/validateImageFile'
import { ChangeEvent, useRef } from 'react'

interface FileInputProps {
    onFileSelect: (files: File | File[]) => void | Promise<void>
    disabled?: boolean
    setProcessing: (processing: boolean) => void
    isProcessing: boolean
    onError: (error: string) => void
    currentFiles?: File[]
    maxFiles?: number
}

const CONSTANTS = {
    DEFAULT_MAX_FILES: 30,
    VALIDATION_MAX_FILES: 10,
    ACCEPT_TYPES: 'image/jpg,image/png,image/jpeg,image/heic',
    MESSAGES: {
        MAX_FILES_EXCEEDED: '사진은 최대 30장 선택할 수 있습니다.',
        PROCESSING_ERROR: '파일 처리 중 오류가 발생했습니다.',
    },
} as const

const FileInput = ({
    onFileSelect,
    disabled = false,
    setProcessing,
    isProcessing = false,
    onError,
    currentFiles = [],
    maxFiles = CONSTANTS.DEFAULT_MAX_FILES,
}: FileInputProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const files = e.target.files
        if (!files || files.length === 0) {
            e.target.value = ''
            return
        }

        const selectedFiles = Array.from(files)
        if (selectedFiles.length === 0) {
            e.target.value = ''
            return
        }
        console.log(selectedFiles)
        setProcessing(true)
        try {
            // 파일 개수 검증
            const totalFiles = currentFiles.length + selectedFiles.length
            const countValidation: any = validateFileCount(Array(totalFiles), CONSTANTS.VALIDATION_MAX_FILES)

            if (!countValidation.isValid) {
                onError(countValidation.error)
                return
            }

            // 파일 타입 및 유효성 검증
            const validationResult: any = validateImageFiles(selectedFiles)

            if (!validationResult.isValid) {
                onError(validationResult.error)
                return
            }

            const validFiles = validationResult.validFiles
            console.log('검증 통과한 파일들:', validFiles)

            // 파일 전달 - 단일 파일은 File, 다중 파일은 File[]
            if (validFiles.length === 1) {
                await onFileSelect(validFiles[0])
            } else {
                await onFileSelect(validFiles)
            }
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

    const handleClick = (): void => {
        if (isProcessing) {
            return
        }
        if (disabled) {
            onError(`사진은 최대 ${maxFiles}장 선택할 수 있습니다.`)
            return
        }
        fileInputRef.current?.click()
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

export default FileInput
