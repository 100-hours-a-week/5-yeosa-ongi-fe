import { ChevronDown, ChevronRight } from 'lucide-react'
import React, { useState } from 'react'

interface CollapsibleContainerProps {
    title: string
    children: React.ReactNode
    defaultExpanded?: boolean
    className?: string
}

const CollapsibleContainer: React.FC<CollapsibleContainerProps> = ({
    title,
    children,
    defaultExpanded = false,
    className = '',
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded)
    }

    return (
        <div className={`overflow-hidden ${className} mx-3`}>
            <button
                onClick={toggleExpanded}
                className='flex items-center justify-between w-full px-4 py-3 text-left transition-colors duration-200 hover:bg-gray-100'
            >
                <h3 className='font-medium text-gray-900'>{title}</h3>
                <div className='flex-shrink-0 ml-2'>
                    {isExpanded ? (
                        <ChevronDown className='w-5 h-5 text-gray-500' />
                    ) : (
                        <ChevronRight className='w-5 h-5 text-gray-500' />
                    )}
                </div>
            </button>

            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className='border-gray-100 '>{children}</div>
            </div>
        </div>
    )
}

export default CollapsibleContainer
