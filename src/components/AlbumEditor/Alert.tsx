export const Alert = ({
    message,
    type = 'error',
    onAction,
    actionText,
}: {
    message: string
    type: string
    onAction: () => void
    actionText: string
}) => {
    if (!message) return null

    const bgColor = type === 'error' ? 'bg-red-100' : 'bg-yellow-100'
    const textColor = type === 'error' ? 'text-red-800' : 'text-yellow-800'

    return (
        <div className={`p-4 mb-4 rounded-md ${bgColor} ${textColor}`}>
            <div className='flex items-center justify-between'>
                <p>{message}</p>
                {onAction && actionText && (
                    <button className='px-3 py-1 ml-4 text-sm font-medium bg-white rounded-md' onClick={onAction}>
                        {actionText}
                    </button>
                )}
            </div>
        </div>
    )
}
