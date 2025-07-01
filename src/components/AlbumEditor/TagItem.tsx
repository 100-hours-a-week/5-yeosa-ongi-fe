import { Check } from 'lucide-react'

interface TagItemProps {
    label: string
    isActive: boolean
    onClick: (label: string) => void
}

const TagItem = ({ label, isActive, onClick }: TagItemProps) => {
    const styleClass = isActive
        ? 'bg-primaryBold text-white border-primary shadow-md'
        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'

    return (
        <button
            onClick={() => onClick(label)}
            className={`
                inline-flex items-center gap-2 rounded-full border font-medium cursor-pointer
                ${styleClass} px-2 py-1 text-xs
                transition-all duration-200 transform active:scale-95
                ${isActive ? 'ring-2 ring-offset-1 ring-primary' : ''}
            `}
        >
            {isActive && <Check size={12} />}
            {label}
        </button>
    )
}

export default TagItem
