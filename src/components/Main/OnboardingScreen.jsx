const OnboardingScreen = () => {
    return (
        <div
            className='relative flex flex-col items-center justify-center h-full text-center bg-gray-100'
            style={{
                height: 'calc(100vh  - 56px)',
            }}
        >
            {/* 메인 메시지 */}
            <div className='px-8 mb-32'>
                <h1 className='text-lg leading-relaxed text-gray-600'>
                    새로운 앨범을 생성해 보세요.
                    <br />
                    온기가 사진을 분류해 줄 겁니다!
                </h1>
            </div>

            {/* 플로팅 버튼 주목용 점선 원형 테두리 */}
            <div
                className='absolute bottom-0 right-0'
                style={{
                    right: '-70px',
                    bottom: '-60px',
                }}
            >
                <div className='relative flex items-center justify-center w-56 h-56'>
                    {/* 점선 원형 테두리 */}
                    <div
                        className='absolute inset-0 bg-white border-2 rounded-full 2border-gray-300 animate-pulse'
                        style={{
                            borderStyle: 'dashed',
                            borderDashArray: '8 20',
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default OnboardingScreen
