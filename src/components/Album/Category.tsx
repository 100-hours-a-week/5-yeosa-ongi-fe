import { useNavigate } from 'react-router-dom'

import { RawPicture } from '@/types'

interface CategoryProps {
    pictures: RawPicture[]
    title: string
    albumId: string
}

const Category = ({ pictures, title, albumId }: CategoryProps) => {
    const navigate = useNavigate()
    const renderDefaultThumbnail = (): HTMLElement => {
        const placeholder = document.createElement('div')
        placeholder.className = 'default-thumbnail'
        placeholder.innerHTML = '📷'
        return placeholder
    }

    return (
        <div className='w-[104px] h-[128px] min-w-[120px] bg-gray-light rounded-md overflow-hidden shadow-sm flex flex-col items-center p-2 pb-0'>
            <button onClick={() => navigate(`/album/${albumId}/${title}`)}>
                {/* 이미지 부분 */}
                {pictures && pictures.length > 0 && pictures[0].pictureURL ? (
                    <div className='size-[96px] w-[100px] border border-gray-300 overflow-hidden'>
                        <img
                            src={pictures[0].pictureURL}
                            alt={title}
                            className='object-cover w-full h-full'
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.parentNode?.appendChild(renderDefaultThumbnail())
                            }}
                        />
                    </div>
                ) : (
                    <div className='w-full'></div>
                )}

                {/* 제목 부분 */}
                <div className='w-full text-sm text-center text-black truncate'>{title}</div>
            </button>
        </div>
    )
}

export default Category
