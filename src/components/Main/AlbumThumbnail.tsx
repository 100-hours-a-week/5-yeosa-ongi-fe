import { useAlbumSummary } from '@/hooks/useAlbum'
import { useAlbumStore, useMainPageStore } from '@/stores/mainPageStore'
import { useNavigate } from 'react-router-dom'
import OptimizedImage from '../common/OptimizedImage'

interface AlbumThumbnailProps {
    id: string
    props: { height: number; width: number }
}
const AlbumThumbnail = ({ id, props }: AlbumThumbnailProps) => {
    const navigate = useNavigate()
    const { albums } = useAlbumStore()
    const album = albums[id.toString()]

    const { data: albumSummary } = useAlbumSummary(id)
    const { selectedId, selectItem, setSelectedAlbumSummary } = useMainPageStore()
    const isSelected = selectedId === id

    const handleSelect = async () => {
        if (isSelected) {
            navigate(`/album/${id}`)
        } else {
            selectItem(id)
            setSelectedAlbumSummary(albumSummary)
        }
    }
    return (
        <div data-album-thumbnail='true' className='relative w-full h-full border-solid' onClick={handleSelect}>
            <OptimizedImage
                src={album?.thumbnailURL || '/default-thumbnail.jpg'}
                alt='Album thumbnail'

                className='absolute inset-0'
                lazy={true}
                placeholder={true}
                onLoad={() => console.log(`이미지 로드 완료: ${id}`)}
            />

            {isSelected && (
                <div className='absolute inset-0 z-10 flex items-center justify-center bg-black opacity-55'>
                    <span className='z-20 text-lg text-white'>{album.albumName}</span>
                </div>
            )}
            {album?.memberProfileImageURL.length > 1 && (
                <div className='absolute flex bottom-2 right-2'>
                    {album?.memberProfileImageURL.map((url: string, index: number) => (
                        <div
                            key={index}
                            className='overflow-hidden rounded-full'
                            style={{
                                width: '24px',
                                height: '24px',
                                marginLeft: index > 0 ? '-8px' : '0',
                                zIndex: album.memberProfileImageURL.length - index,
                            }}
                        >
                            <OptimizedImage
                                src={url}
                                alt={`Collaborator ${index + 1}`}
                                width={24}
                                height={24}
                                className='w-full h-full'
                                lazy={true}
                                placeholder={true}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
export default AlbumThumbnail
