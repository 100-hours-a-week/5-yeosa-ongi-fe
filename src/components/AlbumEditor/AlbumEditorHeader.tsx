import { useNavigate } from 'react-router-dom'

// Assets
<<<<<<< HEAD
import Icon from '../common/Icon'
=======
import Arrow_Left from '@/assets/icons/Arrow_Left.png'
>>>>>>> main

interface AlbumEditorHeaderProps {
    title: string
}

const AlbumEditorHeader = ({ title }: AlbumEditorHeaderProps) => {
    const navigate = useNavigate()
    return (
        <>
            <header className='h-[52px] relative flex items-center justify-center'>
                <button className='absolute left-4 top-1/4' onClick={() => navigate(-1)}>
                    <Icon name='arrow' direction='left' />
                </button>
                <h1 className='text-center'>{title}</h1>
            </header>
        </>
    )
}

export default AlbumEditorHeader
