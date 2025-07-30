export interface CreateAlbumButtonProps {
    buttonState: ButtonState
    onClick: () => void
}
interface ButtonState {
    isAlbumTitleValid: boolean
    isFileUploadValid: boolean
    isLoading: boolean
    isProcessing: boolean
}

const CreateAlbumButton = ({ buttonState, onClick }: CreateAlbumButtonProps) => {
    const active = buttonState.isAlbumTitleValid && buttonState.isFileUploadValid && !buttonState.isLoading

    if (buttonState.isProcessing) {
        return (
            <div className='fixed bottom-0 left-0 right-0 flex justify-center w-full mb-4'>
                <div className='w-full max-w-[440px] px-4'>
                    <button
                        className='z-50 flex items-center justify-center w-full gap-3 text-lg font-bold text-white shadow-lg h-14 rounded-xl bg-primaryBold'
                        disabled={true}
                    >
                        <div className='relative'>
                            {/* 불균형 스피너 - 여러 개의 점들이 불규칙하게 회전 */}
                            <div className='flex space-x-1'>
                                <div
                                    className='w-2 h-2 bg-white rounded-full animate-bounce'
                                    style={{ animationDelay: '0ms', animationDuration: '800ms' }}
                                ></div>
                                <div
                                    className='w-2 h-2 bg-white rounded-full animate-bounce'
                                    style={{ animationDelay: '200ms', animationDuration: '1200ms' }}
                                ></div>
                                <div
                                    className='w-2 h-2 bg-white rounded-full animate-bounce'
                                    style={{ animationDelay: '600ms', animationDuration: '900ms' }}
                                ></div>
                                <div
                                    className='w-2 h-2 bg-white rounded-full animate-bounce'
                                    style={{ animationDelay: '300ms', animationDuration: '1100ms' }}
                                ></div>
                                <div
                                    className='w-2 h-2 bg-white rounded-full animate-bounce'
                                    style={{ animationDelay: '500ms', animationDuration: '700ms' }}
                                ></div>
                            </div>
                        </div>
                        <span>앨범 생성 중...</span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='fixed bottom-0 left-0 right-0 flex justify-center w-full mb-4'>
            <div className='w-full max-w-[440px] px-4'>
                <button
                    className={`
                        h-14 w-full
                        text-lg font-bold z-50
                        rounded-xl
                        shadow-lg
                        ${active ? 'bg-primaryBold text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                    disabled={!active}
                    onClick={onClick}
                >
                    앨범 생성하기
                </button>
            </div>
        </div>
    )
}

export default CreateAlbumButton
