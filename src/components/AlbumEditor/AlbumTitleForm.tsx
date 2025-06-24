import { ChangeEvent, useRef, useState } from 'react'

interface AlbumTitleFormProps {
    value: string
    onChange: (title: string) => void
}

const AlbumTitleForm = ({ value, onChange }: AlbumTitleFormProps) => {
    const titleRef = useRef<HTMLInputElement>(null)
    const [title, setTitle] = useState(value)
    const [isValid, setIsValid] = useState(true)
    const [validationMessage, setValidationMessage] = useState('')

    const validateTitle = () => {
        // 타입 가드
        if (!titleRef.current) {
            console.error('Title input ref is not available')
            return false
        }
        const currentTitle = titleRef.current.value
        if (!currentTitle.trim()) {
            setIsValid(false)
            setValidationMessage('제목을 입력해주세요.')
            return false
        } else if (currentTitle.length > 12) {
            setIsValid(false)
            setValidationMessage('제목은 최대 12자까지 입력 가능합니다.')
            return false
        }
        setIsValid(true)
        setValidationMessage('')
        return true
    }

    const handleBlur = () => {
        if (validateTitle()) {
            onChange(title)
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        onChange(newTitle)

        // 입력 중 유효성 메시지는 지우기
        if (!isValid) {
            setIsValid(true)
            setValidationMessage('')
        }
    }

    return (
        <div className='flex flex-col w-full mt-4 mb-2'>
            <div className='flex items-center pb-2 mx-4 border-b border-gray-300'>
                <div className='w-16 mx-4 text-gray'> 제목</div>
                <input
                    className='w-full text-lg focus:outline-none'
                    ref={titleRef}
                    value={title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={12}
                />
            </div>
        </div>
    )
}

export default AlbumTitleForm
