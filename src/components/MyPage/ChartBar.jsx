import { usePlaceStatistics } from '@/hooks/useUser'
import useAuthStore from '@/stores/userStore'
import { useEffect, useRef, useState } from 'react'

function StorageWidget() {
    const [place, setPlace] = useState({})
    const [maxMemory, setMaxMemory] = useState(0)
    const [data, setData] = useState([])
    const { getUser } = useAuthStore()

    // 현재 년월 생성 (예: "2025-01")
    const currentYearMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

    // ✅ 훅을 컴포넌트 최상위에서 호출
    const { data: placeStatsData, isLoading, error } = usePlaceStatistics(currentYearMonth)

    useEffect(() => {
        // ✅ 데이터가 로드되면 state 업데이트
        if (placeStatsData) {
            console.log('Place statistics:', placeStatsData)

            // tags 데이터가 있는 경우에만 처리
            if (placeStatsData.tags) {
                const transformedData = placeStatsData.tags.map((element, index) => ({
                    name: element.tag,
                    id: index.toString(),
                    memory: element.count,
                    color: index.toString(),
                }))
                setData(transformedData)

                // 최대 메모리 계산
                const totalMemory = placeStatsData.tags.reduce((sum, tag) => sum + tag.count, 0)
                setMaxMemory(totalMemory)
            }

            // 장소 정보 설정
            if (placeStatsData.city || placeStatsData.district || placeStatsData.town) {
                setPlace({
                    city: placeStatsData.city,
                    district: placeStatsData.district,
                    town: placeStatsData.town,
                })
            }
        }
    }, [placeStatsData]) // placeStatsData가 변경될 때만 실행

    // 로딩 상태 처리
    if (isLoading) {
        return (
            <div className='px-3 py-3 m-2 transition bg-gray-100 shadow-md box-shadow rounded-xl'>
                <div className='animate-pulse'>
                    <div className='h-4 mb-2 bg-gray-300 rounded'></div>
                    <div className='h-6 mb-4 bg-gray-300 rounded'></div>
                    <div className='h-4 bg-gray-300 rounded'></div>
                </div>
            </div>
        )
    }

    // 에러 상태 처리
    if (error) {
        return (
            <div className='px-3 py-3 m-2 transition bg-gray-100 shadow-md box-shadow rounded-xl'>
                <div className='text-red-500'>데이터를 불러오는 중 오류가 발생했습니다.</div>
            </div>
        )
    }

    // 데이터가 없는 경우
    if (!data.length) {
        return (
            <div className='px-3 py-3 m-2 transition bg-gray-100 shadow-md box-shadow rounded-xl'>
                <div className='text-gray-500'>이번 달 기록된 장소가 없습니다.</div>
            </div>
        )
    }

    let memoryUsed = 0
    for (let cat of data) {
        memoryUsed += cat.memory
    }

    const cats = [...data]
    const memoryOnly = cats.map(cat => cat.memory)
    const memoryCompounded = []

    for (let i = 0; i < memoryOnly.length; ++i) {
        memoryCompounded.push(memoryOnly.slice(0, i + 1).reduce((a, b) => a + b))
    }

    const user = getUser()

    return (
        <div className='px-3 py-3 m-2 transition bg-gray-100 shadow-md box-shadow rounded-xl'>
            <div className='mb-2'>
                <div>
                    {user?.nickname || '사용자'} 님이 {new Date().getMonth() + 1}월에 가장 많이 기록한 곳은
                </div>
                <div className='text-lg font-semibold text-gray-600 truncate transition-colors dark:text-gray-400'>
                    {place.town || '정보 없음'}
                </div>
            </div>
            <StorageWidgetBarGraph>
                {cats.map((cat, i) => {
                    const percentCurrent = cat.memory / maxMemory
                    const offset = memoryCompounded[i - 1] / maxMemory || 0
                    const ariaLabel = `${cat.memory} ${cat.name}`
                    const forEmpty = i === cats.length - 1

                    return (
                        <StorageWidgetBar
                            key={cat.id}
                            color={cat.color}
                            percent={percentCurrent}
                            offset={offset}
                            ariaLabel={ariaLabel}
                            forEmpty={forEmpty}
                        />
                    )
                })}
            </StorageWidgetBarGraph>
            <StorageWidgetCategoryList>
                {cats.map(cat => (
                    <StorageWidgetCategory key={cat.id} color={cat.color} name={cat.name} memory={cat.memory} />
                ))}
            </StorageWidgetCategoryList>
        </div>
    )
}

// 나머지 컴포넌트들은 동일
function StorageWidgetBar({ color, percent = 0, offset = 0, forEmpty, ariaLabel }) {
    const animationRef = useRef(0)
    const [animated, setAnimated] = useState(false)
    const barColor = Utils.fillColor(color)
    const barPercent = percent * 100
    const barOffset = offset * 100
    const containerStyle = {
        transform: `translateX(${animated ? 0 : -barOffset}%)`,
    }
    const containerXPos = forEmpty === true ? 'right-0' : 'left-0'
    const barStyle = {
        opacity: animated || forEmpty === true ? 1 : 0,
        right: 'auto',
        left: `${barOffset}%`,
        width: `${barPercent}%`,
    }
    const borderClass = offset === 0 ? '' : 'border-l border-l-2 border-l-white dark:border-l-gray-800'

    if (forEmpty === true) {
        containerStyle.transform = `translateX(${animated ? `calc(2px + ${barOffset}%)` : 0})`
        barStyle.right = '0'
        barStyle.left = 'auto'
        barStyle.width = 'calc(100% + 2px)'
    }

    useEffect(() => {
        animationRef.current = setTimeout(() => setAnimated(true), 200)
        return () => {
            clearTimeout(animationRef.current)
        }
    }, [])

    return (
        <div className='absolute inset-0 overflow-hidden rounded-full rtl:-scale-x-100'>
            <div
                className={`absolute top-0 ${containerXPos} w-full h-full transition-transform duration-700`}
                style={containerStyle}
            >
                <div
                    className={`${barColor} ${borderClass} absolute top-0 h-full transition-colors`}
                    style={barStyle}
                    aria-label={ariaLabel}
                ></div>
            </div>
        </div>
    )
}

function StorageWidgetBarGraph({ children }) {
    return <div className='relative h-4 mb-5 backdrop-blur-md box-shadow drop-shadow'>{children}</div>
}

function StorageWidgetCategory({ color, name, memory = 0 }) {
    const catColor = Utils.fillColor(color)

    return (
        <div className='flex items-center gap-2'>
            <div className={`${catColor} rounded-sm w-3 h-3 transition-colors`}></div>
            <span className='flex gap-x-1.5'>
                <strong className='text-xs font-light text-gray-600 transition-colors '>{name}</strong>
                <span className='text-xs font-light text-gray-600 transition-colors'>{memory}</span>
            </span>
        </div>
    )
}

function StorageWidgetCategoryList({ children }) {
    return <div className='flex flex-wrap text-sm gap-x-5 gap-y-1'>{children}</div>
}

class Utils {
    static fillColor(color) {
        const colorKeys = {
            0: 'bg-primaryBold',
            1: 'bg-primary',
            green: 'bg-green-500',
            cyan: 'bg-cyan-500',
            blue: 'bg-blue-500',
            gray: 'bg-gray-500',
            default: 'bg-gray-200 dark:bg-gray-600',
        }

        return color ? colorKeys[color] : colorKeys['default']
    }
}

export default StorageWidget
