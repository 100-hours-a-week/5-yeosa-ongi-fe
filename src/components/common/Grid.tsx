import { GridItem } from '@/types'
import { FC, memo, useCallback, useMemo } from 'react'

interface GridProps {
    col?: number
    items?: GridItem[]
}

const Grid: FC<GridProps> = memo(({ col = 4, items = [] }) => {
    const chunkArrayByCol = useCallback((array: GridItem[], chunkSize: number): GridItem[][] => {
        if (!array || array.length === 0) {
            return []
        } else {
            return Array(Math.ceil(array.length / chunkSize))
                .fill(null)
                .map((_, index: number) => {
                    // For each placeholder, return a slice of the original array
                    const start = index * chunkSize
                    return array.slice(start, start + chunkSize)
                })
        }
    }, [])

    const chunkArray = useMemo(() => {
        console.log(items)
        return chunkArrayByCol(items, col)
    }, [items, col, chunkArrayByCol])

    return (
        <>
            {chunkArray.map((array, rowIndex) => (
                <div
                    key={`row-${rowIndex}`}
                    className='relative grid'
                    style={{
                        gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))`,
                        height: `calc(min(100vw,430px) / ${col})`,
                    }}
                >
                    {array.map((item: GridItem, index: number) => {
                        console.log(`🔑 렌더링 key: ${item.id || `${rowIndex}-${index}`}`)
                        return (
                            <item.ElementType
                                {...(item.id ? { id: item.id } : {})}
                                key={item.id || `${rowIndex}-${index}`}
                                {...item.props}
                            ></item.ElementType>
                        )
                    })}
                </div>
            ))}
        </>
    )
})

export default Grid
