import { FlottingButton, Header, ResizableContainer } from '@/components/common'
import { AlbumList, AlbumListHeader, KakaoMap } from '@/components/Main'
import ViewToggleButton from '@/components/Main/viewToggleButton'
import { UI_HEIGHT } from '@/constants'
import { useCallback, useState } from 'react'

type view = 'LIST_VIEW' | 'MAP_VIEW'

const Main = () => {
    const [listHeight, setListHeight] = useState(0)
    const [view, setView] = useState<view>('LIST_VIEW')

    const getMapHeight = () => {
        const availableHeight = window.innerHeight - UI_HEIGHT.HEADER_HEIGHT
        const mapHeight = availableHeight - listHeight
        return Math.max(0, mapHeight)
    }

    const toggleView = () => {
        setView(prev => (prev === 'LIST_VIEW' ? 'MAP_VIEW' : 'LIST_VIEW'))
    }

    const handleListHeightChange = useCallback((height: number) => {
        setListHeight(height)
    }, [])

    return (
        <div className='relative h-screen overflow-hidden'>
            <Header />
            <div className='flex-col content'>
                <div className='relative' style={{ height: 'calc(100vh - 56px)' }}>
                    {/* 뷰 전환 버튼 */}
                    <ViewToggleButton toggleView={toggleView} view={view} />
                    {view === 'LIST_VIEW' ? (
                        <div className='h-full'>
                            <div className='h-full overflow-hidden'>
                                <AlbumListHeader />
                                <div className='h-full pb-20 overflow-auto'>
                                    <AlbumList view={view} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className='absolute inset-0 border-t border-solid'>
                                <KakaoMap height={getMapHeight()} />
                            </div>
                            <ResizableContainer className='' onHeightChange={handleListHeightChange}>
                                <AlbumListHeader />
                                <AlbumList />
                            </ResizableContainer>
                        </>
                    )}
                </div>
            </div>
            <FlottingButton />
        </div>
    )
}
export default Main
