import { useNavigate } from 'react-router-dom'

// Components
import IncomeChart from '@/components/MyPage/Chart'
import StorageWidget from '@/components/MyPage/ChartBar'
import Header from '../components/common/Header'

const MyActivities = () => {
    const navigate = useNavigate()

    return (
        <>
            <Header showButtons={false} />
            <StorageWidget />
            <IncomeChart />
        </>
    )
}

export default MyActivities
