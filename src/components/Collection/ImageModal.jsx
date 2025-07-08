import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import Icon from '../common/Icon'

const ImageModal = ({ idx, pictures }) => {
    const [index, setIndex] = useState(idx)
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadUrl, setDownloadUrl] = useState(null)
    const [isPreparingDownload, setIsPreparingDownload] = useState(true)
    // Event Handlers

    /**
     * 다운로드 링크 사전 생성
     * @param {*} imageUrl
     * @returns
     */
    const prepareDownload = async imageUrl => {
        const [downloadUrl, setDownloadUrl] = useState(null)
        const [isPreparingDownload, setIsPreparingDownload] = useState(true)
        // Event Handlers

        /**
         * 다운로드 링크 사전 생성
         * @param {*} imageUrl
         * @returns
         */
        const prepareDownload = async imageUrl => {
            const proxies = [
                `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`,
                `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`,
                `https://cors-anywhere.herokuapp.com/${imageUrl}`, // 사전 활성화 필요
                `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(imageUrl)}`,
            ]

            for (let i = 0; i < proxies.length; i++) {
                try {
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
                    setDownloadUrl(url)
                    console.log('다운로드 링크 생성 성공!')
                    setDownloadUrl(url)
                    console.log('다운로드 링크 생성 성공!')
                    return // 성공하면 루프 종료
                } catch (error) {
                    console.error(`프록시 ${i + 1} 실패:`, error)

                    // 마지막 프록시도 실패하면 에러 표시
                    if (i === proxies.length - 1) {
                        console.error('모든 다운로드 링크 생성 방법이 실패했습니다.')
                        setDownloadUrl(null)
                        console.error('모든 다운로드 링크 생성 방법이 실패했습니다.')
                        setDownloadUrl(null)
                    }
                }
            }
        }

        const handleDownload = async () => {
            if (!downloadUrl) {
                if (isPreparingDownload) {
                    console.log('다운로드 준비 중입니다. 잠시만 기다려주세요.')
                    return
                }

                // 다운로드 링크 생성 재시도
                setIsPreparingDownload(true)
                await prepareDownload(pictures[index].pictureURL)
                setIsPreparingDownload(false)

                if (!downloadUrl) {
                    alert('다운로드 링크 생성에 실패했습니다. 잠시 후 다시 시도해주세요.')
                    return
                }
            }

            setIsDownloading(true)

            try {
                const link = document.createElement('a')
                link.href = downloadUrl
                link.download = `image_${Date.now()}.jpg`
                link.style.display = 'none'

                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                console.log('다운로드 시작!')
            } catch (error) {
                console.error('다운로드 실패:', error)
                alert('다운로드에 실패했습니다.')
            } finally {
                setIsDownloading(false)
            }
        }
    }

    const handleDownload = async () => {
        if (!downloadUrl) {
            if (isPreparingDownload) {
                console.log('다운로드 준비 중입니다. 잠시만 기다려주세요.')
                return
            }

            // 다운로드 링크 생성 재시도
            setIsPreparingDownload(true)
            await prepareDownload(pictures[index].pictureURL)
            setIsPreparingDownload(false)

            if (!downloadUrl) {
                alert('다운로드 링크 생성에 실패했습니다. 잠시 후 다시 시도해주세요.')
                return
            }
        }

        setIsDownloading(true)

        try {
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = `image_${Date.now()}.jpg`
            link.style.display = 'none'

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            console.log('다운로드 시작!')
        } catch (error) {
            console.error('다운로드 실패:', error)
            alert('다운로드에 실패했습니다.')
        } finally {
            setIsDownloading(false)
        }
    }

    const handleMoveLeft = () => {
        setIndex(index - 1)
    }

    const handleMoveRight = () => {
        setIndex(index + 1)
    }

    // 이미지가 변경될 때마다 다운로드 링크를 새로 생성
    useEffect(() => {
        setIsPreparingDownload(true)
        setDownloadUrl(null)

        const currentImageUrl = pictures[index].pictureURL
        prepareDownload(currentImageUrl).finally(() => {
            setIsPreparingDownload(false)
        })

        // cleanup: 이전 다운로드 URL 해제
        return () => {
            if (downloadUrl) {
                window.URL.revokeObjectURL(downloadUrl)
            }
        }
    }, [index, pictures])

    // 컴포넌트 언마운트 시 다운로드 URL 해제
    useEffect(() => {
        return () => {
            if (downloadUrl) {
                window.URL.revokeObjectURL(downloadUrl)
            }
        }
    }, [downloadUrl])

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
                        <Icon name='arrow' className='' direction='left' />
                    </button>
                )}

                {/* 오른쪽 버튼 */}
                {index !== pictures.length - 1 && (
                    <button
                        className='absolute p-2 transform -translate-y-1/2 rounded-full right-4 top-1/2 '
                        onClick={handleMoveRight}
                    >
                        <Icon name='arrow' className='' direction='right' />
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
                        <div className='flex items-center'>
                            Download
                            <Download className='w-4 h-4 mx-2' />
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
