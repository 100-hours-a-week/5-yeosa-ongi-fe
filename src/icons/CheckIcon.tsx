import { BaseIconProps } from '@/types/icon.types'
import React from 'react'

interface CheckIconProps extends BaseIconProps {
    checked?: boolean
}

const CheckIcon: React.FC<CheckIconProps> = ({
    size = 24,
    className = '',
    color = 'currentColor',
    checked = true,
    onClick,
}) => (
    <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke={color}
        strokeWidth='2'
        className={`${className} ${onClick ? 'cursor-pointer' : ''} ${checked ? 'opacity-100' : 'opacity-50'}`}
        onClick={onClick}
    >
        <path d='M20 6 9 17l-5-5' />
    </svg>
)

export default CheckIcon
