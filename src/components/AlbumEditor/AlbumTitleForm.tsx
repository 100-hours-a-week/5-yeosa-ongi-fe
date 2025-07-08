import { ALBUM_TEXTS } from '@/constants/text'
import { useState } from 'react'
import TextField from '../common/TextField'

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
            setValidationMessage(ALBUM_TEXTS.TITLE_REQUIRED)
            onValidationChange?.(false)
            return false
        } else if (title.length > 12) {
            setIsValid(false)
            setValidationMessage(ALBUM_TEXTS.TITLE_MAX_LENGTH)
            onValidationChange?.(false)
            return false
        }
        setIsValid(true)
        setValidationMessage('')
        onValidationChange?.(true)
        return true
    }

    const handleChange = (newTitle: string) => {
        onChange(newTitle)
        if (!isValid) {
            setIsValid(true)
            setValidationMessage('')
        }
    }

    return (
        <div className='flex flex-col w-full mt-4 mb-2'>
            <div className='flex items-center pb-2 mx-4 border-b border-gray-300'>
                <div className='w-16 mx-4 font-medium text-gray-900'> {ALBUM_TEXTS.TITLE}</div>
                <TextField
                    className='w-full text-md focus:outline-none'
                    value={value}
                    onChange={handleChange}
                    maxLength={12}
                    validator={validateTitle}
                    helperText={validationMessage}
                />
            </div>
        </div>
    )
}

export default AlbumTitleForm
