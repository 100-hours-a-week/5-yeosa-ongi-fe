import { useAlbumStore, useMainPageStore } from '@/stores/mainPageStore'
import { useNavigate } from 'react-router-dom'
import { getAlubmSummary } from '../../api/album'
import OptimizedImage from '../common/OptimizedImage'

interface AlbumThumbnailProps {
    id: string
}
const AlbumThumbnail = ({ id }: AlbumThumbnailProps) => {
    const navigate = useNavigate()
    const { albums } = useAlbumStore()
    const album = albums[id.toString()]

    const { selectedId, selectItem, setSelectedAlbumSummary } = useMainPageStore()
    const isSelected = selectedId === id

    const handleSelect = async () => {
        if (isSelected) {
            console.log('앨범 상세페이지로 이동 : ', id)
            navigate(`/album/${id}`)
        } else {
            selectItem(id)
            const response = await getAlubmSummary(id)
            setSelectedAlbumSummary(response.data)
        }
    }

    const generateWebpSrc = (originalUrl: string | undefined): string | undefined => {
        if (!originalUrl || originalUrl === '/default-thumbnail.jpg') {
            return undefined // 기본 이미지는 WebP 변환하지 않음
        }

        // URL의 확장자를 .webp로 변경
        return originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    }

    return (
        <div data-album-thumbnail='true' className='relative w-full h-full border-solid' onClick={handleSelect}>
            {/* <img
                className='absolute inset-0 object-cover w-full h-full'
                src={album?.thumbnailURL || '/default-thumbnail.jpg'}
                alt='Album thumbnail'
            /> */}
            <OptimizedImage
                src={album?.thumbnailURL || '/default-thumbnail.jpg'}
                webpSrc={generateWebpSrc(album?.thumbnailURL)}
                alt='Album thumbnail'
                className='absolute inset-0 object-cover w-full h-full'
                lazy={true}
                placeholder={true}
                onLoad={() => console.log('상품 이미지 로드됨')}
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
                            <img
                                className='object-cover w-full h-full'
                                src={`${url}`}
                                alt={`Collaborator ${index + 1}`}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
export default AlbumThumbnail
