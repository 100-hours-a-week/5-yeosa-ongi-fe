import RightArrow from '@/assets/icons/Arrow Right.png'
import LeftArrow from '@/assets/icons/Arrow_Left.png'
import downloadIcon from '@/assets/icons/download.png'
import { useState } from 'react'
const ImageModal = ({ idx, pictures }) => {
    const [index, setIndex] = useState(idx)
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async imageUrl => {
        const proxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`,
            `https://cors-anywhere.herokuapp.com/${imageUrl}`, // 사전 활성화 필요
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(imageUrl)}`,
        ]

        for (let i = 0; i < proxies.length; i++) {
            try {
                setIsDownloading(true)
                console.log(`프록시 ${i + 1} 시도 중...`)

                const response = await fetch(proxies[i])

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const blob = await response.blob()

                if (blob.size === 0) {
                    throw new Error('빈 파일')
                }

                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `image_${Date.now()}.jpg`
                link.style.display = 'none'

                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)

                console.log('다운로드 성공!')
                return // 성공하면 루프 종료
            } catch (error) {
                console.error(`프록시 ${i + 1} 실패:`, error)

                // 마지막 프록시도 실패하면 에러 표시
                if (i === proxies.length - 1) {
                    alert('모든 다운로드 방법이 실패했습니다.')
                }
            } finally {
                setIsDownloading(false)
            }
        }
    }

    const handleMoveLeft = () => {
        setIndex(index - 1)
    }

    const handleMoveRight = () => {
        setIndex(index + 1)
    }
    // const handleDelete = () => {
    //     // 삭제 기능
    //     console.log('삭제')
    // }

    return (
        <div className='flex flex-col h-full'>
            {/* 상단 투명 여백 */}
            <div className='flex bg-transparent'></div>

            <div className='flex justify-center'>
                <img
                    className='max-w-full max-h-[60vh] object-contain'
                    src={pictures[index].pictureURL}
                    alt={`이미지 ${index + 1}`}
                />
                {/* 왼쪽 버튼 */}
                {index !== 0 && (
                    <button
                        className='absolute p-2 transform -translate-y-1/2 rounded-full left-4 top-1/2'
                        onClick={handleMoveLeft}
                    >
                        <img src={LeftArrow} className='h-3' alt='이전' />
                    </button>
                )}

                {/* 오른쪽 버튼 */}
                {index !== pictures.length - 1 && (
                    <button
                        className='absolute p-2 transform -translate-y-1/2 rounded-full right-4 top-1/2 '
                        onClick={handleMoveRight}
                    >
                        <img src={RightArrow} className='h-3' alt='다음' />
                    </button>
                )}
            </div>

            {/* 버튼 영역 */}
            <div className='flex justify-center gap-4 p-2 '>
                <button
                    onClick={() => handleDownload(pictures[index].pictureURL)}
                    className='px-4 py-2 transition-colors '
                >
                    {isDownloading ? (
                        <div>
                            <div className='flex items-center justify-center'>
                                <div className='w-6 h-6 border-4 border-gray-300 rounded-full border-t-gray-500 animate-spin'></div>
                            </div>
                        </div>
                    ) : (
                        <div className='flex'>
                            Download
                            <img className='h-4 mx-2 mt-1' src={downloadIcon}></img>
                        </div>
                    )}
                </button>
                {/* <button onClick={handleDelete} className='px-4 py-2 text-white transition-colors '>
                    <img className='h-4' src={trashIcon}></img>
                </button> */}
            </div>
        </div>
    )
}

export default ImageModal
