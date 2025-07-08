import { ChangeEvent, useState } from 'react'

interface AlbumTitleFormProps {
    value: string
    onChange: (title: string) => void
    onValidationChange?: (isValid: boolean) => void
}

const AlbumTitleForm = ({ value, onChange, onValidationChange }: AlbumTitleFormProps) => {
    const [isValid, setIsValid] = useState(true)
    const [validationMessage, setValidationMessage] = useState('')

    const validateTitle = (title: string) => {
        if (!title.trim()) {
            setIsValid(false)
            setValidationMessage('제목을 입력해주세요.')
            onValidationChange?.(false)
            return false
        } else if (title.length > 12) {
            setIsValid(false)
            setValidationMessage('제목은 최대 12자까지 입력 가능합니다.')
            onValidationChange?.(false)
            return false
        }
        setIsValid(true)
        setValidationMessage('')
        onValidationChange?.(true)
        return true
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        onChange(newTitle)

        // 입력 중에는 에러 메시지만 클리어
        if (!isValid) {
            setIsValid(true)
            setValidationMessage('')
        }
    }

    const handleBlur = () => {
        validateTitle(value)
    }

    return (
        <div className='flex flex-col w-full mt-4 mb-2'>
            <div className='flex items-center pb-2 mx-4 border-b border-gray-300'>
                <div className='w-16 mx-4 font-medium text-gray-900'> 제목</div>
                <input
                    className='w-full text-lg focus:outline-none'
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={12}
                />
            </div>
        </div>
    )
}

export default AlbumTitleForm
