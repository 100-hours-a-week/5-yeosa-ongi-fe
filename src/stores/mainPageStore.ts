import { create } from 'zustand'

interface Data {
    pictureId: number
    pictureURL: string
    latitude: number
    longitude: number
}

interface MainPageState {
    selectedId: string | null
    selectedAlbumSummary: Data | null
    setSelectedAlbumSummary: (data: Data) => void
    selectItem: (id: string) => void
    getSelectedId: () => string | null
    getSelectedAlbumSummary: () => Data | null
    clearSelection: () => void
}

const useMainPageStore = create<MainPageState>((set, get) => ({
    selectedId: null, // 현재 선택된 항목의 ID
    selectedAlbumSummary: null,
    setSelectedAlbumSummary: (data: Data) => set({ selectedAlbumSummary: data }),
    selectItem: (id: string) => set({ selectedId: id }),
    getSelectedId: () => get().selectedId,
    getSelectedAlbumSummary: () => get().selectedAlbumSummary,
    clearSelection: () => set({ selectedId: null, selectedAlbumSummary: null }),
}))

export interface AlbumData {
    albumId: number
    albumName: string
    thumbnailPictureURL: string
    latitude: number
    longitude: number
    createdAt: string
    memberProfileImageURL: string[]
}

// 저장되는 앨범 인터페이스
interface Album {
    albumName: string
    thumbnailURL: string
    latitude: number
    longitude: number
    createdAt: string
    memberProfileImageURL: string[]
}

interface AlbumState {
    albums: Record<string, Album>
    albumsByMonth: Record<string, string[]>
    setAlbums: (albumData: AlbumData[]) => void
    addAlbums: (albumData: AlbumData[]) => string[]
}

const useAlbumStore = create<AlbumState>((set, get) => ({
    albums: {},
    albumsByMonth: {},

    setAlbums: albumData => {
        const albums: Record<string, Album> = {}
        const albumsByMonth: Record<string, string[]> = {}

        albumData.forEach(album => {
            const date = new Date(album.createdAt)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

            if (!albumsByMonth[monthKey]) {
                albumsByMonth[monthKey] = []
            }
            albums[album.albumId.toString()] = {
                albumName: album.albumName,
                thumbnailURL: album.thumbnailPictureURL,
                latitude: album.latitude,
                longitude: album.longitude,
                createdAt: album.createdAt,
                memberProfileImageURL: album.memberProfileImageURL,
            }
            albumsByMonth[monthKey].push(album.albumId.toString())
        })

        // 각 월별 배열을 createdAt 기준으로 내림차순 정렬
        Object.keys(albumsByMonth).forEach(monthKey => {
            albumsByMonth[monthKey].sort((a: string, b: string) => {
                const dateA = new Date(albums[a].createdAt)
                const dateB = new Date(albums[b].createdAt)
                return dateB.getTime() - dateA.getTime() // 내림차순 (최신순)
            })
        })

        set({
            albums,
            albumsByMonth,
        })
    },

    addAlbums: albumData => {
        // 현재 상태 가져오기
        const { albums, albumsByMonth } = get()

        // 새로운 앨범 데이터와 기존 데이터를 병합할 객체 생성
        const updatedAlbums = { ...albums }
        const updatedAlbumsByMonth = { ...albumsByMonth }

        // 새 앨범이 추가된 월들을 추적
        const affectedMonths = new Set<string>()

        // 새 앨범 데이터 처리
        albumData.forEach(album => {
            const date = new Date(album.createdAt)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

            // 해당 월이 없으면 생성
            if (!updatedAlbumsByMonth[monthKey]) {
                updatedAlbumsByMonth[monthKey] = []
            }

            // 앨범 객체 추가
            updatedAlbums[album.albumId.toString()] = {
                albumName: album.albumName,
                thumbnailURL: album.thumbnailPictureURL,
                latitude: album.latitude,
                longitude: album.longitude,
                createdAt: album.createdAt,
                memberProfileImageURL: album.memberProfileImageURL,
            }

            // 앨범 ID가 해당 월에 없는 경우에만 추가 (중복 방지)
            if (!updatedAlbumsByMonth[monthKey].includes(album.albumId.toString())) {
                updatedAlbumsByMonth[monthKey].push(album.albumId.toString())
                affectedMonths.add(monthKey) // 변경된 월 추가
            }
        })

        // 새 앨범이 추가된 월들만 정렬
        affectedMonths.forEach((monthKey: string) => {
            updatedAlbumsByMonth[monthKey].sort((a: string, b: string) => {
                const dateA = new Date(updatedAlbums[a].createdAt)
                const dateB = new Date(updatedAlbums[b].createdAt)
                return dateB.getTime() - dateA.getTime()
            })
        })

        // 상태 업데이트
        set({
            albums: updatedAlbums,
            albumsByMonth: updatedAlbumsByMonth,
        })

        // 새로 추가된 월 키 반환 (필요시 활용 가능)
        return Object.keys(updatedAlbumsByMonth).filter(key => !Object.keys(albumsByMonth).includes(key))
    },
}))

export { useAlbumStore, useMainPageStore }
