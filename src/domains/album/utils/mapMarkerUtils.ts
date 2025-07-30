// 타입 정의
export interface AlbumData {
    latitude: number
    longitude: number
    thumbnailUrl?: string
    [key: string]: any
}

export interface ClusterStyle {
    width: string
    height: string
    background: string
    borderRadius: string
    color: string
    textAlign: 'center' | 'left' | 'right'
    lineHeight: string
    fontSize: string
    fontWeight: string
    border: string
}

export interface ClusterConfig {
    averageCenter: boolean
    minLevel: number
    disableClickZoom: boolean
    gridSize: number
    calculator: number[]
    styles: ClusterStyle[]
}

export type SelectItemCallback = (albumId: string) => void
export type PanToCallback = (latitude: number, longitude: number) => void

/**
 * 간단한 커스텀 오버레이 콘텐츠 생성
 */
export const createCustomOverlayContent = (thumbnailURL: string | undefined): HTMLDivElement => {
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

    if (thumbnailURL) {
        const img = document.createElement('img')
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            pointer-events: none;
        `

        img.onload = () => {
            // 로딩 성공 시에만 이미지 표시
            markerDiv.innerHTML = ''
            markerDiv.appendChild(img)
        }

        img.onerror = () => {
            // 로딩 실패 시 기본 아이콘 표시
            markerDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #ccc;">
                    <div style="font-size: 20px;">📷</div>
                </div>
            `
        }

        // 이미지 로딩 시작
        img.src = thumbnailURL

        // 초기 로딩 상태
        markerDiv.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #999;">
                <div style="font-size: 16px;">📷</div>
            </div>
        `
    } else {
        // 썸네일이 없는 경우
        markerDiv.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #ccc;">
                <div style="font-size: 20px;">📷</div>
            </div>
        `
    }

    // 호버 효과
    markerDiv.addEventListener('mouseenter', () => {
        markerDiv.style.transform = 'scale(1.1)'
    })
    markerDiv.addEventListener('mouseleave', () => {
        markerDiv.style.transform = 'scale(1)'
    })

    return markerDiv
}

/**
 * 사진 마커 콘텐츠 생성
 */
export const createPhotoMarkerContent = (thumbnailURL: string | undefined): HTMLDivElement => {
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
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        `

        img.onload = () => {
            markerDiv.innerHTML = ''
            markerDiv.appendChild(img)
        }

        img.onerror = () => {
            markerDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #ccc;">
                    <div style="font-size: 12px;">📷</div>
                </div>
            `
        }

        img.src = thumbnailURL
    } else {
        markerDiv.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #ccc;">
                <div style="font-size: 12px;">📷</div>
            </div>
        `
    }

    return markerDiv
}

/**
 * 클러스터 스타일 설정
 */
export const CLUSTER_STYLES: ClusterStyle[] = [
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
        border: '2px solid #F3D0D7',
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
        border: '2px solid #F3D0D7',
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
        border: '3px solid #F3D0D7',
    },
]

export const CLUSTER_CONFIG: ClusterConfig = {
    averageCenter: true,
    minLevel: 5,
    disableClickZoom: false,
    gridSize: 60,
    calculator: [5, 10, 20, 50],
    styles: CLUSTER_STYLES,
}

/**
 * 마커 클릭 이벤트 핸들러 생성
 */
export const createMarkerClickHandler = (
    albumId: string,
    albumData: AlbumData,
    selectItem: SelectItemCallback,
    panTo: PanToCallback
): (() => void) => {
    return () => {
        selectItem(albumId)
        panTo(albumData.latitude, albumData.longitude)
    }
}

/**
 * 커스텀 오버레이 클릭 이벤트 핸들러 생성
 */
export const createOverlayClickHandler = (
    albumId: string,
    albumData: AlbumData,
    selectItem: SelectItemCallback,
    panTo: PanToCallback
): ((e: Event) => void) => {
    return (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        selectItem(albumId)
        panTo(albumData.latitude, albumData.longitude)
    }
}
