import Arrow_Left from '@/assets/icons/Arrow_Left.png'
import { useNavigate } from 'react-router-dom'
const AlbumEditorHeader = ({ title }) => {
    const navigate = useNavigate()
    return (
        <>
            <header className='h-[52px] relative flex items-center justify-center'>
                <button className='absolute left-4 top-1/4' onClick={() => navigate(-1)}>
                    <img className='h-4' src={Arrow_Left} alt='뒤로가기' />
                </button>
                <h1 className='text-center'>{title}</h1>
            </header>
        </>
    )
}

export default AlbumEditorHeader
