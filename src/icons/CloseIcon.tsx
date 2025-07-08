import { BaseIconProps } from '@/types/icon.types'
import React from 'react'

const CloseIcon: React.FC<BaseIconProps> = ({ size = 24, className = '', color = 'currentColor', onClick }) => (
    <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke={color}
        strokeWidth='2'
        className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
    >
        <path d='M18 6 6 18' />
        <path d='m6 6 12 12' />
    </svg>
)

export default CloseIcon
