import { useCallback, useState } from 'react'

// Components
import ResizableContainer from '@/components/common/ResizableContainer'
import AlbumListHeader from '@/components/Main/AlbumListHeader'
import BannerSlider from '@/components/Main/BannerSlider'
import KakaoMap from '@/components/Main/KakaoMap'
import List from '@/components/Main/List'
import FlottingButton from '../components/common/FlottingButton'
import Header from '../components/common/Header'

const CONSTANTS = {
    HEADER_HEIGHT: 56,
    BANNER_HEIGHT: 72,
}

const Main = () => {
    const [listHeight, setListHeight] = useState(0)

    /**
     * 지도의 실제 높이 계산
     * @returns
     */
    const getMapHeight = () => {
        const totalHeight = window.innerHeight - CONSTANTS.HEADER_HEIGHT
        const availableHeight = totalHeight - CONSTANTS.BANNER_HEIGHT
        const mapHeight = availableHeight - listHeight
        return Math.max(0, mapHeight)
    }

    const handleListHeightChange = useCallback((height: number) => {
        setListHeight(height)
    }, [])

    return (
        <div className='relative h-screen overflow-hidden'>
            <Header />
            <div className='flex-col content'>
                <div className='relative' style={{ height: 'calc(100vh - 56px)' }}>
                    <BannerSlider />
                    <div className='absolute inset-0 top-[72px] border-t border-solid'>
                        <KakaoMap height={getMapHeight()} />
                    </div>
                    <ResizableContainer className='' onHeightChange={handleListHeightChange}>
                        <AlbumListHeader />
                        <List />
                    </ResizableContainer>
                </div>
            </div>

            <FlottingButton />
        </div>
    )
}
export default Main
