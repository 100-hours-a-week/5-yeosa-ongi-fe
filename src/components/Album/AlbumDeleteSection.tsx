import { useState } from 'react'
import TextField from '../common/TextField'

export interface AlbumDeleteSectionProps {
    albumName: string
    handleDelete: () => void
    isDeleting: boolean
}

const AlbumDeleteSection = ({ albumName, handleDelete, isDeleting }: AlbumDeleteSectionProps) => {
    const [isValid, setIsValid] = useState(false)
    const handleOnChange = (newValue: string) => {
        const inputValue = newValue
        const expectedValue = albumName

        setIsValid(inputValue === expectedValue)
    }
    return (
        <div className='relative flex flex-col w-full h-full max-w-md mx-auto bg-white'>
            <div className='p-5 border-b'>
                <h3 className='text-lg font-medium text-gray-800'>앨범 삭제</h3>
            </div>

            <div className='flex-grow p-5'>
                <TextField
                    placeholder={albumName || '앨범 이름을 입력해주세요.'}
                    maxLength={12}
                    label={`삭제할 앨범 : ${albumName}`}
                    onChange={handleOnChange}
                    disabled={isDeleting}
                />

                <p className='flex items-center mt-2 text-xs text-red-600'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-4 h-4 mr-1'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                        />
                    </svg>
                    앨범을 삭제하시려면 앨범 명을 정확히 입력해 주세요.
                </p>
            </div>

            <div className='flex justify-end p-4 space-x-3 border-t'>
                <button
                    className='px-4 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={isDeleting}
                >
                    취소
                </button>
                <button
                    onClick={handleDelete}
                    disabled={!isValid || isDeleting}
                    className={`px-4 py-2 font-medium text-white transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center space-x-2 ${
                        isValid && !isDeleting
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 cursor-pointer'
                            : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                    {isDeleting ? (
                        <>
                            <div className='w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent'></div>
                            <span>삭제 중...</span>
                        </>
                    ) : (
                        <span>삭제</span>
                    )}
                </button>
            </div>
        </div>
    )
}

export default AlbumDeleteSection
