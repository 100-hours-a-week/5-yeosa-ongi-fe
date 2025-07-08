import { BaseIconProps } from '@/types/icon.types'
import React from 'react'

interface HeartIconProps extends BaseIconProps {
    filled?: boolean
    animated?: boolean
}

const HeartIcon: React.FC<HeartIconProps> = ({
    size = 24,
    className = '',
    color = 'currentColor',
    filled = false,
    animated = false,
    onClick,
}) => (
    <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth='2'
        className={`${className} ${onClick ? 'cursor-pointer' : ''} ${animated ? 'transition-all duration-200 hover:scale-110' : ''}`}
        onClick={onClick}
    >
        <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
    </svg>
)

export default HeartIcon
