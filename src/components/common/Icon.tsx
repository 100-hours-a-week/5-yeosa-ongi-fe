import { ArrowIcon, CheckIcon, CloseIcon, HeartIcon } from '@/icons/index'
import { BaseIconProps } from '@/types/icon.types'
import React from 'react'

// 개별 아이콘 컴포넌트들을 등록
const iconComponents = {
    heart: HeartIcon,
    close: CloseIcon,
    arrow: ArrowIcon,
    check: CheckIcon,
} as const

export type IconName = keyof typeof iconComponents

// 각 아이콘의 특별한 props들을 통합
interface IconProps extends BaseIconProps {
    name: IconName

    // HeartIcon props
    filled?: boolean
    animated?: boolean

    // ArrowIcon props
    direction?: 'up' | 'down' | 'left' | 'right'

    // CheckIcon props
    checked?: boolean
}

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
    const IconComponent = iconComponents[name]

    if (!IconComponent) {
        console.warn(`아이콘 '${name}'을 찾을 수 없습니다.`)
        return null
    }

    return <IconComponent {...props} />
}

export default Icon
