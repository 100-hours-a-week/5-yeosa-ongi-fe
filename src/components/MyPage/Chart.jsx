import { usePictureStatistics } from '@/hooks/useUser'
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
import { useMemo, useState } from 'react'
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
        const day = date.getDate()
        return `${day}일`
    } catch (error) {
        return dateString // 에러 시 원본 반환
    }
}

const IncomeChart = () => {
    const [selectedOption, setSelectedOption] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)

    const options = [
        { label: 'Last 30 Days', value: '30days' },
        // { label: 'This Year', value: 'year' },
    ]

    // 현재 년월 생성 (예: "2025-01")
    const currentYearMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

    // ✅ React Query 훅을 컴포넌트 최상위에서 호출
    const { data: pictureStatsData, isLoading, error } = usePictureStatistics(currentYearMonth)

    // 차트 데이터 가공
    const chartData = useMemo(() => {
        if (!pictureStatsData?.dailyImageCount) {
            return null
        }

        const dailyData = pictureStatsData.dailyImageCount
        const labels = Object.keys(dailyData).map(date => formatDate(date))
        const photos = Object.values(dailyData)
        const total = photos.reduce((sum, count) => sum + count, 0)

        return {
            total,
            labels,
            photos,
        }
    }, [pictureStatsData])

    // 로딩 상태
    if (isLoading) {
        return (
            <div className='p-3 m-2 text-gray-700 bg-gray-100 shadow-md box-shadow rounded-xl'>
                <div className='animate-pulse'>
                    <div className='w-3/4 h-6 mb-5 bg-gray-300 rounded'></div>
                    <div className='bg-gray-300 rounded h-80'></div>
                </div>
            </div>
        )
    }

    // 에러 상태
    if (error) {
        return (
            <div className='p-3 m-2 text-gray-700 bg-gray-100 shadow-md box-shadow rounded-xl'>
                <div className='py-10 text-center text-red-500'>
                    데이터를 불러오는데 실패했습니다.
                    <br />
                    <button
                        onClick={() => window.location.reload()}
                        className='px-4 py-2 mt-2 text-white bg-red-500 rounded hover:bg-red-600'
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        )
    }

    // 데이터가 없는 경우
    if (!chartData || chartData.photos.length === 0) {
        return (
            <div className='p-3 m-2 text-gray-700 bg-gray-100 shadow-md box-shadow rounded-xl'>
                <div className='py-10 text-center text-gray-500'>이번 달 업로드된 사진이 없습니다.</div>
            </div>
        )
    }

    // Chart.js 데이터 설정
    const chartJsData = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'photos',
                backgroundColor: '#feb4b8',
                borderColor: '#feb4b8',
                pointBackgroundColor: '#feb4b8',
                data: chartData.photos,
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
                <div className='flex flex-wrap items-end mb-5'>
                    <h4 className='inline-block mr-2 text-gray-900 text-md'>
                        이번 달에는 총 {formatNumber(chartData.total)}개의 사진을 업로드 했습니다.
                    </h4>
                </div>

                <div className='h-80'>
                    <Line data={chartJsData} options={chartOptions} />
                </div>
            </div>

            {/* 드롭다운 외부 클릭 시 닫기 */}
            {showDropdown && <div className='fixed inset-0 z-20' onClick={() => setShowDropdown(false)}></div>}
        </>
    )
}

export default IncomeChart
