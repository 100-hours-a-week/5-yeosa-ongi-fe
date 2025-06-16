import { changeAlbumName } from '@/api/album'
import { useParams } from 'react-router-dom'
import EditableText from '../common/EditableText'

const AlbumTitle = ({ title }) => {
    const { albumId } = useParams()
    const handleSaveName = async newValue => {
        // 서버 저장 시뮬레이션
        try {
            const response = await changeAlbumName(albumId, newValue)
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
