/**
 * 클러스터 스타일 설정
 */
export const CLUSTER_STYLES = [
    {
        width: '50px',
        height: '50px',
        background: 'rgba(243, 208, 215, 0.8)',
        borderRadius: '25px',
        color: '#333',
        textAlign: 'center',
        lineHeight: '50px',
        fontSize: '12px',
        fontWeight: 'bold',
        border: '2px solid #F3D0D7'
    },
    {
        width: '60px',
        height: '60px',
        background: 'rgba(243, 208, 215, 0.9)',
        borderRadius: '30px',
        color: '#333',
        textAlign: 'center',
        lineHeight: '60px',
        fontSize: '14px',
        fontWeight: 'bold',
        border: '2px solid #F3D0D7'
    },
    {
        width: '70px',
        height: '70px',
        background: 'rgba(243, 208, 215, 1)',
        borderRadius: '35px',
        color: '#333',
        textAlign: 'center',
        lineHeight: '70px',
        fontSize: '16px',
        fontWeight: 'bold',
        border: '3px solid #F3D0D7'
    }
]

/**
 * 클러스터 설정
 */
export const CLUSTER_CONFIG = {
    averageCenter: true,
    minLevel: 5,
    disableClickZoom: false,
    gridSize: 60,
    calculator: [5, 10, 20, 50],
    styles: CLUSTER_STYLES
}

/**
 * 커스텀 오버레이 콘텐츠 생성 함수
 */
export const createCustomOverlayContent = (thumbnailURL) => {
    const markerDiv = document.createElement('div')
    markerDiv.className = 'album-marker'
    markerDiv.style.cssText = `
        width: 60px;
        height: 60px;
        border: 4px solid #F3D0D7;
        border-radius: 8px;
        overflow: hidden;
        background: white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        position: relative;
        z-index: 100;
        transition: transform 0.2s ease;
    `

    const img = document.createElement('img')
    img.src = thumbnailURL
    img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        pointer-events: none;
    `
    img.onerror = () => (img.style.display = 'none')

    markerDiv.appendChild(img)

    // 호버 효과 추가
    markerDiv.addEventListener('mouseenter', () => {
        markerDiv.style.transform = 'scale(1.1)'
    })
    markerDiv.addEventListener('mouseleave', () => {
        markerDiv.style.transform = 'scale(1)'
    })

    return markerDiv
}

/**
 * 사진 마커 콘텐츠 생성 함수
 */
export const createPhotoMarkerContent = (thumbnailURL) => {
    const markerDiv = document.createElement('div')
    markerDiv.className = 'photo-marker'
    markerDiv.style.cssText = `
        width: 40px;
        height: 40px;
        border: 3px solid #FF6B6B;
        border-radius: 50%;
        overflow: hidden;
        background: white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        position: relative;
        z-index: 200;
    `

    if (thumbnailURL) {
        const img = document.createElement('img')
        img.src = thumbnailURL
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        `
        markerDiv.appendChild(img)
    }

    return markerDiv
}

/**
 * 마커 클릭 이벤트 핸들러 생성
 */
export const createMarkerClickHandler = (albumId, albumData, selectItem, panTo) => {
    return () => {
        selectItem(albumId)
        panTo(albumData.latitude, albumData.longitude)
    }
}

/**
 * 커스텀 오버레이 클릭 이벤트 핸들러 생성
 */
export const createOverlayClickHandler = (albumId, albumData, selectItem, panTo) => {
    return (e) => {
        e.preventDefault()
        e.stopPropagation()
        selectItem(albumId)
        panTo(albumData.latitude, albumData.longitude)
    }
}
