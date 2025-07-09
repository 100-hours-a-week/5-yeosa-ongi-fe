import { BaseIconProps } from '@/types/icon.types'
import React from 'react'

const EditIcon: React.FC<BaseIconProps> = ({ size = 24, className = '', color = 'currentColor', onClick }) => {
    const getPath = () => {
        return <path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z' />
    }

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
            {getPath()}
        </svg>
    )
}

export default EditIcon
