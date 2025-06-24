import { GridItem } from '@/types'
import React, { FC, memo, useCallback, useMemo } from 'react'

interface GridProps {
    col?: number
    children: React.ReactNode // children 추가
    items?: GridItem[] // 기존 items는 선택적으로
}

export const GridWithChildren: FC<GridProps> = memo(({ col = 4, children, items }) => {
    // children이 있으면 children 사용, 없으면 기존 items 방식
    if (children) {
        const childArray = React.Children.toArray(children)
        const rows = []

        // col 개수만큼 행별로 분할
        for (let i = 0; i < childArray.length; i += col) {
            rows.push(childArray.slice(i, i + col))
        }
        return (
            <>
                {rows.map((rowChildren, rowIndex) => (
                    <div
                        key={`row-${rowIndex}`}
                        className='grid'
                        style={{
                            gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))`,
                            height: `calc(min(100vw,430px) / ${col})`,
                        }}
                    >
                        {rowChildren.map((child, childIndex) => child)}
                    </div>
                ))}
            </>
        )
    }

    // 기존 items 방식 (하위 호환성)
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
        return chunkArrayByCol(items || [], col)
    }, [items, col, chunkArrayByCol])

    return (
        <>
            {chunkArray.map((array: GridItem[], rowIndex: number) => (
                <div
                    key={`row-${rowIndex}`}
                    className='grid'
                    style={{
                        gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))`,
                        height: `calc(min(100vw,430px) / ${col})`,
                    }}
                >
                    {array.map((item: GridItem, index: number) => (
                        <item.ElementType key={item.id || `${rowIndex}-${index}`} {...item.props} />
                    ))}
                </div>
            ))}
        </>
    )
})
