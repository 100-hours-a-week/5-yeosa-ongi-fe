import { changeAlbumName } from '@/api/album'
import { useParams } from 'react-router-dom'
import EditableText from '../common/EditableText'

interface AlbumTitleProps {
    title: string
}

const AlbumTitle = ({ title }: AlbumTitleProps) => {
    const { albumId } = useParams()
    const handleSaveName = async (newValue: string) => {
        try {
            const response = await changeAlbumName(albumId as string, newValue)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className='p-4'>
            <EditableText
                value={title}
                onSave={handleSaveName}
                textFieldProps={{
                    placeholder: '이름을 입력하세요',
                    required: true,
                }}
            />
        </div>
    )
}

export default AlbumTitle
