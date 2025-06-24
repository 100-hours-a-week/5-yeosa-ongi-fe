const MovingDotsLoader = () => {
    return (
        <div className='flex items-center justify-center min-h-screen bg-white'>
            <div className='flex space-x-2'>
                {[0, 1, 2, 3].map(index => (
                    <div
                        key={index}
                        className='w-4 h-4 rounded-full bg-primary'
                        style={{
                            animation: `moveRight 2s ease-in-out infinite`,
                            animationDelay: `${index * 0.2}s`,
                        }}
                    />
                ))}
            </div>

            <style>
                {`
          @keyframes moveRight {
            0%, 100% {
              transform: translateX(0px);
              opacity: 0.4;
            }
            50% {
              transform: translateX(20px);
              opacity: 1;
            }
          }
        `}
            </style>
        </div>
    )
}

export default MovingDotsLoader
