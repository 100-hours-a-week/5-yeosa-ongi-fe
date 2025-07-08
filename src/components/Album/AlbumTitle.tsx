<<<<<<< HEAD
import { useUpdateAlbumName } from '@/hooks/useAlbum'
=======
import { changeAlbumName } from '@/api/album'
>>>>>>> main
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import EditableText from '../common/EditableText'

const validator = (value: string) => {
    if (value === '') {
        return '제목을 입력하세요'
    } else if (value.length > 12) {
        return '12글자 이하'
    } else {
        return true
    }
}
interface AlbumTitleProps {
    title: string
}

const AlbumTitle = ({ title }: AlbumTitleProps) => {
    const { albumId } = useParams()
    const [currentTitle, setCurrentTitle] = useState<string>(title)
<<<<<<< HEAD
    const changeAlbumName = useUpdateAlbumName()

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
=======

    const handleSaveName = async (newValue: string) => {
        try {
            const response = await changeAlbumName(albumId as string, newValue)
            // 성공하면 로컬 상태 업데이트
            setCurrentTitle(newValue)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className='p-4'>
            <EditableText
>>>>>>> main
                value={currentTitle}
                onSave={handleSaveName}
                textFieldProps={{
                    placeholder: '이름을 입력하세요',
                    required: true,
                    validator: validator,
                }}
            />
        </div>
    )
}

export default AlbumTitle
