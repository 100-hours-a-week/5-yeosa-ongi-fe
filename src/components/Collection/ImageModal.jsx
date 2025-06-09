import RightArrow from '@/assets/icons/Arrow Right.png'
import LeftArrow from '@/assets/icons/Arrow_Left.png'
import downloadIcon from '@/assets/icons/download.png'
import { useState } from 'react'
const ImageModal = ({ idx, pictures }) => {
    const [index, setIndex] = useState(idx)
    console.log(idx, index, pictures)

    const handleDownload = () => {
        // 다운로드 기능
        console.log('다운로드')
    }

    const handleMoveLeft = () => {
        console.log('왼쪽 사진으로 이동')
        setIndex(index - 1)
    }

    const handleMoveRight = () => {
        console.log('오른쪽 사진으로 이동')
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
                <button onClick={handleDownload} className='px-4 py-2 transition-colors '>
                    <div className='flex'>
                        Download
                        <img className='h-4 mx-2 mt-1' src={downloadIcon}></img>
                    </div>
                </button>
                {/* <button onClick={handleDelete} className='px-4 py-2 text-white transition-colors '>
                    <img className='h-4' src={trashIcon}></img>
                </button> */}
            </div>
        </div>
    )
}

export default ImageModal
