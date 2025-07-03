import { useAlbumSummary } from '@/hooks/useAlbum'
import { useAlbumStore, useMainPageStore } from '@/stores/mainPageStore'
import { generateOptimizedUrl } from '@/utils/imageOptimizer'
import { useNavigate } from 'react-router-dom'

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

    const optimizedSrc = generateOptimizedUrl(
        album?.thumbnailURL || '/default-thumbnail.jpg',
        props?.width || 200,
        props?.height || 200
    )

    const handleSelect = async () => {
        if (isSelected) {
            navigate(`/album/${id}`)
        } else {
            selectItem(id)
            setSelectedAlbumSummary(albumSummary)
        }
    }

    const generateAdvancedImageSrc = (originalUrl: string | undefined) => {
        if (!originalUrl || originalUrl === '/default-thumbnail.jpg') {
            return {
                avif: undefined,
                webp: undefined,
                fallback: originalUrl,
            }
        }

        const baseUrl = originalUrl.replace(/\.(jpg|jpeg|png|webp)$/i, '')
        return {
            avif: `${baseUrl}.avif`,
            webp: originalUrl.endsWith('.webp') ? originalUrl : `${baseUrl}.webp`,
            fallback: originalUrl,
        }
    }

    const { avif, webp, fallback } = generateAdvancedImageSrc(album?.thumbnailURL)

    return (
        <div data-album-thumbnail='true' className='relative w-full h-full border-solid' onClick={handleSelect}>
            {/* <img
                className='absolute inset-0 object-cover w-full h-full'
                src={album?.thumbnailURL || '/default-thumbnail.jpg'}
                alt='Album thumbnail'
            /> */}
            <picture className='absolute inset-0'>
                {webp && <source srcSet={webp} type='image/webp' />}
                <img
                    className='object-cover w-full h-full'
                    src={fallback || '/default-thumbnail.jpg'}
                    alt='Album thumbnail'
                    width={props?.width}
                    height={props?.height}
                    loading='lazy'
                    decoding='async'
                    onLoad={() => console.log('이미지 로드됨')}
                />
            </picture>

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
