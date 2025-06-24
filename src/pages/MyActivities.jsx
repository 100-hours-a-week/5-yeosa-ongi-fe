import { useNavigate } from 'react-router-dom'

// Components
import IncomeChart from '@/components/MyPage/Chart'
import StorageWidget from '@/components/MyPage/ChartBar'
import Intro from '@/components/MyPage/Intro'
import MostTag from '@/components/MyPage/MostTag'
import Header from '../components/common/Header'

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
