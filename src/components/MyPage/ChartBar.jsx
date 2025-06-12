import { getPlaceStatistic } from '@/api/user'
import { useEffect, useRef, useState } from 'react'

function StorageWidget({ maxMemory = 21 }) {
    const [data, setData] = useState([])

    useEffect(() => {
        const getUserData = async () => {
            const response = await getPlaceStatistic('')
            console.log(response.data)
            setData([{ name: response.data.tags, id: '1', memory: 1, color: 'cyan' }])
        }
        getUserData()
    }, [])
    let memoryUsed = 0

    for (let cat of data) {
        memoryUsed += cat.memory
    }

    const cats = [
        ...data,
        {
            id: '0',
            name: 'Free',
            memory: maxMemory - memoryUsed,
        },
    ]
    const memoryOnly = cats.map(cat => cat.memory)
    const memoryCompounded = []

    for (let i = 0; i < memoryOnly.length; ++i) {
        // create an array where each value is a total of the previous values; this is needed for the bar position animations
        memoryCompounded.push(memoryOnly.slice(0, i + 1).reduce((a, b) => a + b))
    }

    return (
        <div className='px-5 py-5 transition bg-white border-y'>
            <div className='mb-2'>
                <div>00 님이 4월에 가장 많이 방문한 곳은</div>
                <div className='font-semibold text-gray-600 truncate transition-colors dark:text-gray-400'>판교</div>
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
    return <div className='relative h-5 mb-5'>{children}</div>
}

function StorageWidgetCategory({ color, name, memory = 0 }) {
    const catColor = Utils.fillColor(color)

    return (
        <div className='flex items-center gap-2'>
            <div className={`${catColor} rounded-sm w-4 h-3 transition-colors`}></div>
            <span className='flex gap-x-1.5'>
                <strong className='font-semibold text-gray-900 transition-colors dark:text-gray-100'>{name}</strong>
                <span className='text-gray-600 transition-colors dark:text-gray-400'>{memory}</span>
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
            red: 'bg-red-500',
            yellow: 'bg-yellow-500',
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
