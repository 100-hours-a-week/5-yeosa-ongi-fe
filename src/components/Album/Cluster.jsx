import { useEffect, useState } from 'react'

const Cluster = ({ cluster }) => {
    const [style, setStyle] = useState(null)

    useEffect(() => {
        const img = new Image()
        img.src = cluster.clusterPicture[0]
        img.onload = () => {
            const { naturalWidth, naturalHeight } = img

            // 원래 bbox
            let bboxX1 = cluster.bboxX1
            let bboxY1 = cluster.bboxY1
            let bboxX2 = cluster.bboxX2
            let bboxY2 = cluster.bboxY2

            const bboxWidth = bboxX2 - bboxX1
            const bboxHeight = bboxY2 - bboxY1

            const paddingRatio = 0.1

            const padX = bboxWidth * paddingRatio
            const padY = bboxHeight * paddingRatio

            bboxX1 = Math.max(0, bboxX1 - padX)
            bboxY1 = Math.max(0, bboxY1 - padY)
            bboxX2 = Math.min(naturalWidth, bboxX2 + padX)
            bboxY2 = Math.min(naturalHeight, bboxY2 + padY)

            const paddedWidth = bboxX2 - bboxX1
            const paddedHeight = bboxY2 - bboxY1

            const scale = Math.min(64 / paddedWidth, 64 / paddedHeight)

            const backgroundWidth = naturalWidth * scale
            const backgroundHeight = naturalHeight * scale

            const centerX = (bboxX1 + bboxX2) / 2
            const centerY = (bboxY1 + bboxY2) / 2

            const offsetX = centerX * scale - 32
            const offsetY = centerY * scale - 32

            setStyle({
                backgroundImage: `url(${cluster.clusterPicture[0]})`,
                backgroundSize: `${backgroundWidth}px ${backgroundHeight}px`,
                backgroundPosition: `-${offsetX}px -${offsetY}px`,
                width: '64px',
                height: '64px',
                borderRadius: '9999px',
                overflow: 'hidden',
                backgroundRepeat: 'no-repeat',
            })
        }
    }, [cluster])

    return (
        <div className='flex flex-col items-center space-y-3 cursor-pointer group'>
            <div className='relative p-1 rounded-full bg-gradient-to-tr from-[#F3D0D7] to-[#F3D0D7]'>
                <div className='bg-white rounded-full'>
                    <div className='relative' style={style} />
                </div>
            </div>

            <div className='text-center max-w-20 sm:max-w-24'>
                <span className='text-xs leading-tight text-gray-800 transition-colors sm:text-sm line-clamp-2 group-hover:text-gray-600'>
                    {cluster.clusterName}
                </span>
            </div>
        </div>
    )
}

export default Cluster
