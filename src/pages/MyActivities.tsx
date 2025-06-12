import { useNavigate } from 'react-router-dom'

// Components
import { getUserActivities } from '@/api/user'
import IncomeChart from '@/components/MyPage/Chart'
import { useEffect } from 'react'
import Header from '../components/common/Header'

const MyActivities = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const getUserData = async () => {
            const response = await getUserActivities('')
            console.log(response.data)
        }
        getUserData()
    }, [])
    return (
        <>
            <Header showButtons={false} />
            <IncomeChart />
        </>
    )
}

export default MyActivities
