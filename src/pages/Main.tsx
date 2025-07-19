import { FlottingButton, Header, ResizableContainer } from '@/components/common'
import { AlbumList, AlbumListHeader, BannerSlider, KakaoMap } from '@/components/Main'
import { UI_HEIGHT } from '@/constants'
import { useCallback, useState } from 'react'

const Main = () => {
    const [listHeight, setListHeight] = useState(0)

    const getMapHeight = () => {
        const totalHeight = window.innerHeight - UI_HEIGHT.HEADER_HEIGHT
        const availableHeight = totalHeight - UI_HEIGHT.BANNER_HEIGHT
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
                        <AlbumList />
                    </ResizableContainer>
                </div>
            </div>
            <FlottingButton />
        </div>
    )
}
export default Main
