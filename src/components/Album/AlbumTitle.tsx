import { ALBUM_TITLE_VALIDATION_MESSAGE } from '@/constants/validation'
import { useToast } from '@/contexts/ToastContext'
import { useAlbumDetail, useUpdateAlbumName } from '@/queries/album'
import { useParams } from 'react-router-dom'
import EditableText from '../common/EditableText'

const AlbumTitle = () => {
    const { albumId } = useParams()

    //Custom Hooks
    const { data: albumDetail } = useAlbumDetail(albumId!)
    const changeAlbumName = useUpdateAlbumName()
    const toast = useToast()

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
            changeAlbumName.mutate(
                { albumId, albumName: newValue },
                {
                    onSuccess: () => {
                        toast.success('앨범 이름 수정에 성공하였습니다.')
                    },
                    onError: () => {
                        toast.error('앨범 이름 수정에 실패하였습니다.')
                    },
                }
            )
        }
    }

    return (
        <div className='p-4 pb-0'>
            <EditableText
                displayClassName='font-semibold text-gray-600'
                value={albumDetail.title}
                onSave={handleSaveName}
                textFieldProps={{
                    maxLength: 12,
                    placeholder: ALBUM_TITLE_VALIDATION_MESSAGE.TITLE_REQUIRED,
                    required: true,
                    validator: validateTitle,
                }}
            />
        </div>
    )
}

export default AlbumTitle
