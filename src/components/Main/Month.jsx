import Grid from '@/components/common/Grid'
import { useEffect, useRef } from 'react'
import AlbumThumbnail from './AlbumThumbnail'

const Month = ({ albumIds, title }) => {
    const gridRef = useRef(null)
    let items = []
    albumIds.forEach(id => {
        items.push({ ElementType: AlbumThumbnail, element: id, id })
    })
    useEffect(() => {
        const handleClickOutside = event => {
            if (gridRef.current && !gridRef.current.contains(event.target)) {
                console.log('Grid 외부 클릭됨')
                // 원하는 동작 실행
                handleOutsideClick()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleOutsideClick = () => {
        // Grid 외부 클릭 시 실행할 동작
        console.log('Grid 바깥 영역 클릭!')
    }
    return (
        <>
            <div className='h-8 p-1 ml-2 text-md'>{title}</div>
            <div ref={gridRef}>
                <Grid items={items}></Grid>
            </div>
        </>
    )
}

export default Month
