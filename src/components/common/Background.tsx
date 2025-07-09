const Background = () => {
    return (
        <div className='relative w-full h-screen overflow-hidden'>
            {/* 메인 배경 그라데이션 */}
            <div className='absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-100 to-pink-200'></div>

            {/* 움직이는 흐릿한 형태들 - 큰 요소들 */}
            <div
                className='absolute w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-3xl
                      animate-[float_20s_ease-in-out_infinite]
                      top-1/4 left-1/4'
            ></div>

            <div
                className='absolute w-[400px] h-[400px] bg-rose-200/50 rounded-full blur-3xl
                      animate-[float2_25s_ease-in-out_infinite]
                      top-1/2 right-1/4'
            ></div>

            <div
                className='absolute w-[600px] h-[300px] bg-pink-100/30 rounded-full blur-3xl
                      animate-[float3_30s_ease-in-out_infinite]
                      bottom-1/3 left-1/2 transform -translate-x-1/2'
            ></div>

            {/* 중간 크기 움직이는 요소들 */}
            <div
                className='absolute w-[300px] h-[300px] bg-rose-300/35 rounded-full blur-2xl
                      animate-[drift_15s_linear_infinite]
                      top-1/3 right-1/3'
            ></div>

            <div
                className='absolute w-[250px] h-[250px] bg-pink-300/40 rounded-full blur-2xl
                      animate-[drift2_18s_linear_infinite]
                      bottom-1/4 left-1/5'
            ></div>

            <div
                className='absolute w-[350px] h-[350px] bg-rose-100/45 rounded-full blur-2xl
                      animate-[drift3_22s_linear_infinite]
                      top-2/3 left-2/3'
            ></div>

            {/* 작고 빠른 움직이는 요소들 */}
            <div
                className='absolute w-[150px] h-[150px] bg-pink-200/30 rounded-full blur-xl
                      animate-[spin_10s_linear_infinite]
                      top-1/5 right-1/5'
            ></div>

            <div
                className='absolute w-[200px] h-[100px] bg-rose-100/25 rounded-full blur-xl
                      animate-[spin2_12s_linear_infinite]
                      bottom-1/5 right-2/5'
            ></div>

            {/* 배경에서 지속적으로 움직이는 큰 형태들 */}
            <div
                className='absolute w-[800px] h-[400px] bg-gradient-radial from-pink-200/20 to-transparent rounded-full blur-3xl
                      animate-[rotate_40s_linear_infinite]
                      -top-48 -left-48'
            ></div>

            <div
                className='absolute w-[700px] h-[500px] bg-gradient-radial from-rose-200/15 to-transparent rounded-full blur-3xl
                      animate-[rotate2_35s_linear_infinite]
                      -bottom-48 -right-48'
            ></div>

            {/* CSS 애니메이션 정의 */}
            <style>{`
                @keyframes float {
                    0%,
                    100% {
                        transform: translate(0, 0) scale(1);
                    }
                    25% {
                        transform: translate(30px, -20px) scale(1.1);
                    }
                    50% {
                        transform: translate(-20px, 30px) scale(0.9);
                    }
                    75% {
                        transform: translate(40px, 20px) scale(1.05);
                    }
                }

                @keyframes float2 {
                    0%,
                    100% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    33% {
                        transform: translate(-40px, 25px) rotate(120deg);
                    }
                    66% {
                        transform: translate(25px, -30px) rotate(240deg);
                    }
                }

                @keyframes float3 {
                    0%,
                    100% {
                        transform: translate(-50%, 0) scale(1);
                    }
                    20% {
                        transform: translate(-30%, -40px) scale(1.2);
                    }
                    40% {
                        transform: translate(-70%, 20px) scale(0.8);
                    }
                    60% {
                        transform: translate(-40%, 40px) scale(1.1);
                    }
                    80% {
                        transform: translate(-60%, -20px) scale(0.9);
                    }
                }

                @keyframes drift {
                    0% {
                        transform: translate(0, 0);
                    }
                    100% {
                        transform: translate(-100vw, 20px);
                    }
                }

                @keyframes drift2 {
                    0% {
                        transform: translate(0, 0);
                    }
                    100% {
                        transform: translate(100vw, -30px);
                    }
                }

                @keyframes drift3 {
                    0% {
                        transform: translate(0, 0);
                    }
                    100% {
                        transform: translate(-120vw, 40px);
                    }
                }

                @keyframes spin {
                    0% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    100% {
                        transform: translate(50px, -30px) rotate(360deg);
                    }
                }

                @keyframes spin2 {
                    0% {
                        transform: translate(0, 0) rotate(0deg) scale(1);
                    }
                    50% {
                        transform: translate(-60px, 40px) rotate(180deg) scale(1.3);
                    }
                    100% {
                        transform: translate(0, 0) rotate(360deg) scale(1);
                    }
                }

                @keyframes rotate {
                    0% {
                        transform: rotate(0deg) scale(1);
                    }
                    50% {
                        transform: rotate(180deg) scale(0.8);
                    }
                    100% {
                        transform: rotate(360deg) scale(1);
                    }
                }

                @keyframes rotate2 {
                    0% {
                        transform: rotate(360deg) scale(1);
                    }
                    50% {
                        transform: rotate(180deg) scale(1.2);
                    }
                    100% {
                        transform: rotate(0deg) scale(1);
                    }
                }

                @keyframes particle1 {
                    0%,
                    100% {
                        transform: translate(0, 0);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translate(40px, -60px);
                        opacity: 0.8;
                    }
                }

                @keyframes particle2 {
                    0%,
                    100% {
                        transform: translate(0, 0);
                        opacity: 0.4;
                    }
                    50% {
                        transform: translate(-50px, 30px);
                        opacity: 0.7;
                    }
                }

                @keyframes particle3 {
                    0%,
                    100% {
                        transform: translate(0, 0) scale(1);
                        opacity: 0.2;
                    }
                    33% {
                        transform: translate(30px, -40px) scale(1.5);
                        opacity: 0.6;
                    }
                    66% {
                        transform: translate(-30px, 20px) scale(0.8);
                        opacity: 0.9;
                    }
                }
            `}</style>
        </div>
    )
}

export default Background
