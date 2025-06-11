import Grid from '@/components/common/Grid'
import { useEffect, useRef } from 'react'
import AlbumThumbnail from './AlbumThumbnail'

const Month = ({ albumIds, title, handleOutsideClick }) => {
    const monthRef = useRef(null)
    const gridRef = useRef(null)
    const debounceTimeout = useRef(null)

    let items = []
    albumIds.forEach(id => {
        items.push({ ElementType: AlbumThumbnail, element: id, id })
    })

    useEffect(() => {
        const handleClick = event => {
            const clickedInsideMonth = monthRef.current && monthRef.current.contains(event.target)
            const clickedInsideGrid = gridRef.current && gridRef.current.contains(event.target)

            // AlbumThumbnail 요소인지 확인 (data attribute나 className으로)
            const isAlbumThumbnail =
                event.target.closest('[data-album-thumbnail]') || event.target.closest('.album-thumbnail')

            if (clickedInsideMonth) {
                if (clickedInsideGrid && !isAlbumThumbnail) {
                    console.log('Grid 빈 공간 클릭됨')
                    // Grid 내 빈 공간 클릭
                } else if (!clickedInsideGrid) {
                    console.log('제목 영역 클릭됨')
                    // 제목 영역 클릭
                } else {
                    console.log('AlbumThumbnail 클릭됨 - 무시')
                    return // AlbumThumbnail 클릭은 무시
                }

                if (debounceTimeout.current) {
                    clearTimeout(debounceTimeout.current)
                }

                debounceTimeout.current = setTimeout(() => {
                    handleOutsideClick()
                }, 100)
            }
        }

        document.addEventListener('mousedown', handleClick)

        return () => {
            document.removeEventListener('mousedown', handleClick)
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current)
            }
        }
    }, [handleOutsideClick])

    return (
        <div ref={monthRef} className='py-2'>
            <div className='h-8 p-1 ml-2 text-md'>{title}</div>
            <div ref={gridRef} className='min-h-[100px]'>
                <Grid items={items}></Grid>
            </div>
        </div>
    )
}

export default Month
