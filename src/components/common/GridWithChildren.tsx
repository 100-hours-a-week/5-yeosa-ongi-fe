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

/**
 * 안정적인 키 생성을 위한 유틸리티 함수
 * 기존에 전달받은 키를 최대한 보존하려고 시도합니다
 */
const extractStableKey = (child: React.ReactElement, fallbackIndex: number): string => {
    return child.key!
}

export const GridWithChildren: FC<GridProps> = memo(({ col = 4, children, items }) => {
    // children 방식 처리 - 단일 그리드 컨테이너 사용
    if (children) {
        const childArray = React.Children.toArray(children)

        return (
            <div
                className='grid'
                style={{
                    gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))`,
                    // 각 셀의 높이를 동일하게 설정
                    gridAutoRows: `calc(min(100vw,430px) / ${col})`,
                }}
            >
                {childArray.map((child, index) => {
                    // React element가 아닌 경우 (문자열, 숫자 등) 그대로 반환
                    if (!React.isValidElement(child)) {
                        return child
                    }

                    // 안정적인 키 추출
                    const stableKey = extractStableKey(child, index)

                    // 기존 props를 유지하면서 안정적인 키만 설정
                    // 중요: 기존에 전달받은 key를 덮어쓰지 않고 보존
                    return React.cloneElement(child, {
                        key: stableKey,
                    })
                })}
            </div>
        )
    }

    // items 방식 처리 - 단일 그리드 컨테이너 사용
    if (items && items.length > 0) {
        return (
            <div
                className='grid gap-2'
                style={{
                    gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))`,
                    gridAutoRows: `calc(min(100vw,430px) / ${col})`,
                }}
            >
                {items.map((item, index) => {
                    const Component = item.component

                    // item.id가 있으면 사용, 없으면 props 기반으로 안정적인 키 생성
                    const stableKey = item.id || `item-${JSON.stringify(item.props || {}).slice(0, 20)}-${index}`

                    return <Component key={stableKey} {...(item.props || {})} />
                })}
            </div>
        )
    }

    return null
})
