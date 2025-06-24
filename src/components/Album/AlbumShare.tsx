import iconCheck from '@/assets/icons/icon_check.png'
import iconCopy from '@/assets/icons/icon_copy.png'
import { useState } from 'react'

const AlbumShare = ({ sharingLink = 'https://example.com/share/album123456' }) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard
            .writeText(sharingLink)
            .then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            })
            .catch(err => {
                console.error('복사에 실패했습니다:', err)
            })
    }

    return (
        <div className='relative flex flex-col w-full h-full max-w-md mx-auto bg-white rounded-lg shadow-lg'>
            <div className='p-5 border-b'>
                <h3 className='text-lg font-medium text-gray-800'>앨범 공유</h3>
            </div>

            <div className='flex-grow p-5'>
                <div className='mb-4'>
                    <label htmlFor='sharingLink' className='block mb-1 text-sm font-medium text-gray-700'>
                        공유 링크
                    </label>

                    {/* 복사되는 공유 링크와 복사 버튼 */}
                    <div className='flex items-center mt-2'>
                        <div className='flex-grow w-40 px-3 py-2 overflow-hidden text-sm text-gray-700 truncate border border-gray-300 bg-gray-50 rounded-l-md'>
                            {sharingLink || ' '}
                        </div>
                        <button
                            onClick={handleCopy}
                            className='flex items-center justify-center w-10 h-10 text-white transition-colors border bg-primary rounded-r-md '
                            aria-label='링크 복사하기'
                        >
                            {copied ? (
                                <img className='w-4 h-4' src={iconCheck} alt='복사됨' />
                            ) : (
                                <img className='w-4 h-4' src={iconCopy} alt='복사하기' />
                            )}
                        </button>
                    </div>

                    {/* 복사 성공 메시지 (선택적) */}
                    {copied && <p className='mt-2 text-xs text-green-600'>링크가 클립보드에 복사되었습니다!</p>}

                    {/* 추가 설명 */}
                    <p className='mt-3 text-xs text-gray-500'>
                        이 링크를 공유하면 초대받은 사용자가 앨범을 볼 수 있습니다.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AlbumShare
