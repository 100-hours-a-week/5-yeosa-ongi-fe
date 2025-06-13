import { getPlaceStatistic } from '@/api/user'
import useAuthStore from '@/stores/userStore'
import { useEffect, useRef, useState } from 'react'

function StorageWidget() {
    const [place, setPlace] = useState({})
    const [maxMemory, setMaxMemory] = useState(0)
    const [data, setData] = useState([])
    const { getUser } = useAuthStore()

    useEffect(() => {
        const getUserData = async () => {
            const response = await getPlaceStatistic('')
            console.log(response.data)
            setData(
                response.data.tags.map((element, index) => {
                    return {
                        name: response.data.tags[index].tag,
                        id: index.toString(),
                        memory: response.data.tags[index].count,
                        color: index.toString(),
                    }
                })
            )
            console.log(getUser())
            setPlace({ city: response.data.city, district: response.data.district, town: response.data.town })
            setMaxMemory(Object.values(response.data.tags).reduce((a, b) => a + b))
        }
        getUserData()
    }, [])
    let memoryUsed = 0

    for (let cat of data) {
        memoryUsed += cat.memory
    }

    const cats = [...data]
    const memoryOnly = cats.map(cat => cat.memory)
    const memoryCompounded = []

    for (let i = 0; i < memoryOnly.length; ++i) {
        // create an array where each value is a total of the previous values; this is needed for the bar position animations
        memoryCompounded.push(memoryOnly.slice(0, i + 1).reduce((a, b) => a + b))
    }

    return (
        <div className='px-3 py-3 m-2 transition bg-gray-100 box-shadow rounded-xl'>
            <div className='mb-2'>
                <div>
                    {getUser().nickname} 님이 {new Date().getMonth() + 1}월에 가장 많이 기록한 곳은
                </div>
                <div className='text-lg font-semibold text-gray-600 truncate transition-colors dark:text-gray-400'>
                    {place.town}
                </div>
            </div>
            <StorageWidgetBarGraph>
                {cats.map((cat, i) => {
                    const percentCurrent = cat.memory / maxMemory
                    // use the combined previous percents as the offset
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
        // for the empty fill, start at 100%, then move outside to the end
        containerStyle.transform = `translateX(${animated ? `calc(2px + ${barOffset}%)` : 0})`
        barStyle.right = '0'
        barStyle.left = 'auto'
        barStyle.width = 'calc(100% + 2px)'
    }

    useEffect(() => {
        // allow the animation to run after render
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
    /**
     * Get the fill color for a given color name, or get the theme default.
     * @param {string} color Name of color
     */
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
