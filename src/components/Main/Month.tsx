import { useEffect, useMemo, useRef } from 'react'
import { GridItemConfig, GridWithChildren } from '../common/GridWithChildren'
import AlbumThumbnail from './AlbumThumbnail'

export interface MonthProps {
    albumIds: string[]
    title: string
    handleOutsideClick: () => void
}

const Month = ({ albumIds, title, handleOutsideClick }: MonthProps) => {
    const monthRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

    const items: GridItemConfig[] = useMemo(() => {
        return albumIds.map(id => ({
            id: id,
            component: AlbumThumbnail,
            props: {
                id: id,
                'data-album-thumbnail': true,
                className: 'album-thumbnail',
            },
        }))
    }, [albumIds])

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const target = event.target

            if (!target || !(target instanceof Element)) return

            const isInsideMonth = monthRef.current?.contains(target)
            const isAlbumThumbnail = target.closest('[data-album-thumbnail], .album-thumbnail')

            if (!isInsideMonth || isAlbumThumbnail) return

            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current)
            }

            debounceTimeout.current = setTimeout(handleOutsideClick, 100)
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
        <div ref={monthRef} className='py-1 '>
            <div className='h-8 p-1 ml-1 text-sm '>{title}</div>
            <div ref={gridRef} className='min-h-[100px] '>
                <GridWithChildren items={items}></GridWithChildren>
            </div>
        </div>
    )
}

export default Month
