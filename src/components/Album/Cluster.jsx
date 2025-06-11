const Cluster = ({ cluster }) => {
    return (
        <div className='flex flex-col items-center space-y-3 cursor-pointer group'>
            {/* 원형 이미지 컨테이너 - 그라디언트 테두리 */}
            <div className='relative p-1 rounded-full bg-gradient-to-tr from-primary to-primaryBold'>
                <div className='p-1 bg-white rounded-full'>
                    <div className='w-16 h-16 overflow-hidden rounded-full '>
                        <img
                            src={cluster.clusterPicture[0]}
                            alt={cluster.clusterName}
                            className='object-cover w-full h-full transition-transform duration-300 group-hover:scale-110'
                        />
                    </div>
                </div>
            </div>

            {/* 클러스터 이름 */}
            <div className='text-center max-w-20 sm:max-w-24'>
                <span className='text-xs leading-tight text-gray-800 transition-colors sm:text-sm line-clamp-2 group-hover:text-gray-600'>
                    {cluster.clusterName}
                </span>
            </div>
        </div>
    )
}

export default Cluster
