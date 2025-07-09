import React, { FC, memo } from 'react'

export interface GridItemConfig {
    id?: string
    component: React.ComponentType<any>
    props?: Record<string, any>
}

export interface GridProps {
    col?: number
    children?: React.ReactNode
    items?: GridItemConfig[]
}

export const GridWithChildren: FC<GridProps> = memo(({ col = 4, children, items }) => {
    if (children) {
        const childArray = React.Children.toArray(children)
        const rows = []

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
                        {rowChildren.map((child, childIndex) =>
                            React.cloneElement(child as React.ReactElement, {
                                key: `${rowIndex}-${childIndex}`,
                                ...((child as React.ReactElement).props || {}),
                            })
                        )}
                    </div>
                ))}
            </>
        )
    }

    if (items && items.length > 0) {
        const rows: GridItemConfig[][] = []

        for (let i = 0; i < items.length; i += col) {
            rows.push(items.slice(i, i + col))
        }

        return (
            <>
                {rows.map((rowItems, rowIndex) => (
                    <div
                        key={`row-${rowIndex}`}
                        className='relative grid'
                        style={{
                            gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))`,
                            height: `calc(min(100vw,430px) / ${col})`,
                        }}
                    >
                        {rowItems.map((item, itemIndex) => {
                            const Component = item.component
                            return <Component key={item.id || `${rowIndex}-${itemIndex}`} {...(item.props || {})} />
                        })}
                    </div>
                ))}
            </>
        )
    }

    return null
})
