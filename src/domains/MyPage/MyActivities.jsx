import { useNavigate } from 'react-router-dom'

// Components
import IncomeChart from '@/domains/MyPage/Chart'
import StorageWidget from '@/domains/MyPage/ChartBar'
import Intro from '@/domains/MyPage/Intro'
import MostTag from '@/domains/MyPage/MostTag'
import { Header } from '@/shared/components'

const MyActivities = () => {
    const navigate = useNavigate()

    return (
        <>
            <Header showButtons={false} />
            <Intro />
            <StorageWidget />
            <IncomeChart />
            <MostTag />
        </>
    )
}

export default MyActivities
