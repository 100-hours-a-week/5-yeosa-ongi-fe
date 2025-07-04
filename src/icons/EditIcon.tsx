import { BaseIconProps } from '@/types/icon.types'
import React from 'react'

interface EditIconProps extends BaseIconProps {
    variant?: 'pencil' | 'edit2' | 'edit3'
}

const EditIcon: React.FC<EditIconProps> = ({
    size = 24,
    className = '',
    color = 'currentColor',
    variant = 'pencil',
    onClick,
}) => {
    const getPath = () => {
        switch (variant) {
            case 'pencil':
                return <path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z' />
            case 'edit3':
                return (
                    <>
                        <path d='M12 20h9' />
                        <path d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z' />
                    </>
                )
            case 'edit2':
            default:
                return (
                    <>
                        <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
                        <path d='M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
                    </>
                )
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
