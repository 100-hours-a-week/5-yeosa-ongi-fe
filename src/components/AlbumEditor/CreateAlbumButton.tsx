import { FC } from 'react'

interface CreateAlbumButtonProps {
    disabled: any
    onClick: () => void
    children?: any
}

const CreateAlbumButton: FC<CreateAlbumButtonProps> = ({ disabled, onClick }) => (
    <div className='fixed bottom-0 left-0 right-0 flex justify-center w-full mb-4'>
        <div className='w-full max-w-[528px] px-4'>
            <button
                className={`
          h-14 w-full
          text-lg font-bold z-50
          rounded-xl
          shadow-lg
          ${!disabled ? 'bg-primaryBold text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
        `}
                disabled={disabled}
                onClick={onClick}
            >
                앨범 생성하기
            </button>
        </div>
    </div>
)

export default CreateAlbumButton
