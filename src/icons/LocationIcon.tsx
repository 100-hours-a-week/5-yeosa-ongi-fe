import { BaseIconProps } from '@/types/icon.types'
import React from 'react'

const LocationIcon: React.FC<BaseIconProps> = ({ size = 24, className = '', color = 'currentColor', onClick }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 24 24'
            fill='none'
            stroke={color}
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' />
            <circle cx='12' cy='10' r='3' />
        </svg>
    )
}

export default LocationIcon
