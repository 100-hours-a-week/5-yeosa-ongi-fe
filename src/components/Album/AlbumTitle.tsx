import { ALBUM_TITLE_VALIDATION_MESSAGE } from '@/constants/validation'
import { useUpdateAlbumName } from '@/hooks/useAlbum'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import EditableText from '../common/EditableText'

export interface AlbumTitleProps {
    title: string
}

const AlbumTitle = ({ title }: AlbumTitleProps) => {
    const { albumId } = useParams()
    const [currentTitle, setCurrentTitle] = useState<string>(title)
    const changeAlbumName = useUpdateAlbumName()

    const validateTitle = (title: string) => {
        if (!title.trim()) {
            return false
        } else if (title.length > 12) {
            return false
        }
        return true
    }

    const handleSaveName = async (newValue: string) => {
        if (albumId) {
            changeAlbumName.mutate({ albumId, albumName: newValue })
        }
        setCurrentTitle(newValue)
    }

    return (
        <div className='p-4 pb-0'>
            <EditableText
                displayClassName='font-semibold text-gray-600'
                value={currentTitle}
                onSave={handleSaveName}
                textFieldProps={{
                    placeholder: ALBUM_TITLE_VALIDATION_MESSAGE.TITLE_REQUIRED,
                    required: true,
                    validator: validateTitle,
                }}
            />
        </div>
    )
}

export default AlbumTitle
