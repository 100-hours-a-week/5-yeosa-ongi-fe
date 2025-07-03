import { BaseIconProps } from '@/types/icon.types'
import React from 'react'

interface ArrowIconProps extends BaseIconProps {
    direction?: 'up' | 'down' | 'left' | 'right'
}

const ArrowIcon: React.FC<ArrowIconProps> = ({
    size = 24,
    className = '',
    color = 'currentColor',
    direction = 'right',
    onClick,
}) => {
    const getRotation = () => {
        switch (direction) {
            case 'up':
                return 'rotate-[-90deg]'
            case 'down':
                return 'rotate-90'
            case 'left':
                return 'rotate-180'
            case 'right':
            default:
                return ''
        }
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 24 24'
            fill='none'
            stroke={color}
            strokeWidth='2'
            className={`${className} ${getRotation()} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <path d='m9 18 6-6-6-6' />
        </svg>
    )
}

export default ArrowIcon
