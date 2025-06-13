import { getPictureStatistic } from '@/api/user'
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js'
import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// 숫자 포맷팅 함수
const formatNumber = num => {
    return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
}

// 날짜 포맷팅 함수
const formatDate = dateString => {
    // 이미 포맷된 라벨인 경우 그대로 반환
    if (!dateString.includes('-') || dateString.length < 8) {
        return dateString
    }

    try {
        const date = new Date(dateString)
        const month = date.getMonth() + 1
        const day = date.getDate()

        // DD일
        return `${day}일`
    } catch (error) {
        return dateString // 에러 시 원본 반환
    }
}

const IncomeChart = () => {
    const [data, setData] = useState(null)
    const [selectedOption, setSelectedOption] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)

    const options = [
        { label: 'Last 30 Days', value: '30days' },
        // { label: 'This Year', value: 'year' },
    ]

    const currentDate = options[selectedOption].value

    // 데이터 페치
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getPictureStatistic('')
                console.log(response.data.dailyImageCount)
                setData({
                    '30days': {
                        total: 100,
                        data: {
                            labels: Object.keys(response.data.dailyImageCount).map(date => formatDate(date)),
                            photos: Object.values(response.data.dailyImageCount),
                        },
                    },
                })
            } catch (error) {
                console.error('데이터를 불러오는데 실패했습니다:', error)
                // 샘플 데이터로 대체
                setData({
                    '30days': {
                        total: 324567,
                        data: {
                            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                            income: [85000, 92000, 78000, 95000],
                        },
                    },
                    // year: {
                    //     total: 3874561,
                    //     upDown: 15.6,
                    //     data: {
                    //         labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    //         income: [950000, 1150000, 1270000, 1400000],
                    //     },
                    // },
                })
            }
        }

        fetchData()
    }, [])

    // const handleOptionSelect = index => {
    //     setSelectedOption(index)
    //     setShowDropdown(false)
    // }

    if (!data) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gray-50 min-w-screen'>
                <div className='text-gray-800'>로딩 중...</div>
            </div>
        )
    }

    const currentData = data[currentDate]
    console.log(currentData)
    // Chart.js 데이터 설정
    const chartData = {
        labels: currentData.data.labels,
        datasets: [
            {
                label: 'photos',
                backgroundColor: '#feb4b8',
                borderColor: '#feb4b8',
                pointBackgroundColor: '#feb4b8',
                data: currentData.data.photos,
                tension: 0.1,
                fill: true,
                pointRadius: 0,
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                right: 10,
            },
        },
        scales: {
            y: {
                grid: {
                    display: true,
                    color: '#f3f4f6',
                },
                ticks: {
                    color: '#6b7280',
                    callback: function (value) {
                        return value > 1000 ? (value < 1000000 ? value / 1000 + 'K' : value / 1000000 + 'M') : value
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    maxTicksLimit: 7,
                    color: '#6b7280',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    }

    return (
        <>
            <div className='p-3 m-2 text-gray-700 bg-gray-100 shadow-md box-shadow rounded-xl'>
                {/* <div className='flex flex-wrap items-end'>
                    <div className='relative'>
                        <button
                            className='h-6 text-xs text-gray-600 hover:text-gray-800 focus:outline-none'
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <span>{options[selectedOption].label}</span>
                            <span className='ml-1'>▼</span>
                        </button>
                        {showDropdown && (
                            <div className='absolute right-0 top-auto z-30 w-32 min-w-full mt-1 -mr-3 text-sm bg-white border border-gray-200 rounded-lg shadow-lg'>
                                <span className='absolute top-0 right-0 w-3 h-3 mr-3 -mt-1 transform rotate-45 bg-white border-t border-l border-gray-200'></span>
                                <div className='relative z-10 w-full py-1 bg-white rounded-lg'>
                                    <ul className='text-xs list-none'>
                                        {options.map((item, index) => (
                                            <li
                                                key={index}
                                                className={`px-4 py-2 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-100 cursor-pointer ${
                                                    index === selectedOption
                                                        ? 'text-blue-600 bg-blue-50'
                                                        : 'text-gray-600'
                                                }`}
                                                onClick={() => handleOptionSelect(index)}
                                            >
                                                <span>{item.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div> */}

                <div className='flex flex-wrap items-end mb-5'>
                    <h4 className='inline-block mr-2 text-gray-900 text-md '>
                        이번 달에는 총 {formatNumber(currentData.total)}개의 사진을 업로드 했습니다.
                    </h4>
                </div>

                <div className='h-80'>
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* 드롭다운 외부 클릭 시 닫기 */}
            {showDropdown && <div className='fixed inset-0 z-20' onClick={() => setShowDropdown(false)}></div>}
        </>
    )
}

export default IncomeChart
