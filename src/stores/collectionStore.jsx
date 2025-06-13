import { create } from 'zustand'

const useCollectionStore = create((set, get) => ({
    // 기본 상태
    currentAlbumId: null,
    rawPictures: [],
    allCollection: null,
    shakyCollection: null,
    duplicatedCollection: null,
    tagCollections: [],
    clusterCollections: [],

    // 클러스터 컬렉션 설정
    setClusterCollections: (albumId, clusters) => {
        if (!clusters || clusters.length === 0) {
            set({ clusterCollections: [] })
            return
        }

        // 현재 앨범 ID와 다르면 설정하지 않음
        const { currentAlbumId } = get()
        if (currentAlbumId && currentAlbumId !== albumId) {
            return
        }

        // 클러스터 데이터를 컬렉션 형태로 변환
        const clusterCollections = clusters.map(cluster => ({
            name: cluster.clusterId.toString(),
            alt: cluster.clusterName,
            pictures:
                cluster.clusterPicture.map(picture => {
                    return { pictureURL: picture }
                }) || [],
            count: cluster.clusterPicture ? cluster.clusterPicture.length : 0,
        }))

        set({ clusterCollections })
    },
    // 원본 사진 데이터 설정 및 자동 카테고라이징
    setPicturesAndCategorize: (albumId, pictures) => {
        if (!pictures || pictures.length === 0) return

        set({ currentAlbumId: albumId, rawPictures: pictures })

        // 카테고라이징 로직 실행
        get().categorizePhotos()
    },

    // 카테고라이징 함수
    categorizePhotos: () => {
        const { rawPictures } = get()

        if (!rawPictures || rawPictures.length === 0) return

        // 모든 태그 추출
        const uniqueTags = [...new Set(rawPictures.map(pic => pic.tag).filter(Boolean))]

        // 전체 컬렉션
        const allCollection = {
            name: '전체',
            pictures: rawPictures,
            count: rawPictures.length,
        }

        // 중복 컬렉션
        const duplicatedCollection = {
            name: '중복',
            pictures: rawPictures.filter(pic => pic.isDuplicated),
            count: rawPictures.filter(pic => pic.isDuplicated).length,
        }

        // 흔들림 컬렉션
        const shakyCollection = {
            name: '흔들림',
            pictures: rawPictures.filter(pic => pic.isShaky),
            count: rawPictures.filter(pic => pic.isShaky).length,
        }

        // 태그별 컬렉션
        const tagCollections = uniqueTags
            .map(tag => {
                const filteredPictures = rawPictures.filter(pic => pic.tag === tag && !pic.isShaky && !pic.isDuplicated)

                return {
                    name: tag.trim(),
                    pictures: filteredPictures,
                    count: filteredPictures.length,
                }
            })
            .filter(collection => collection.count > 0)

        // 상태 업데이트
        set({
            allCollection,
            duplicatedCollection,
            shakyCollection,
            tagCollections,
        })
    },

    // 사진 삭제 처리 함수
    removePictures: pictureIds => {
        set(state => {
            // 원본 사진 배열에서 삭제된 사진 제거
            const updatedRawPictures = state.rawPictures.filter(p => !pictureIds.includes(p.pictureId))

            // 업데이트된 원본 사진으로 상태 설정
            return { rawPictures: updatedRawPictures }
        })

        // 카테고라이징 다시 실행하여 모든 컬렉션 업데이트
        get().categorizePhotos()
    },

    // 클러스터 컬렉션에서 삭제된 사진 제거
    updateClusterCollectionsAfterRemove: removedPictureIds => {
        set(state => {
            const updatedClusterCollections = state.clusterCollections
                .map(cluster => {
                    const updatedPictures = cluster.pictures.filter(
                        pictureUrl => !removedPictureIds.includes(pictureUrl)
                    )

                    return {
                        ...cluster,
                        pictures: updatedPictures,
                        count: updatedPictures.length,
                    }
                })
                .filter(cluster => cluster.count > 0) // 빈 클러스터 제거

            return { clusterCollections: updatedClusterCollections }
        })
    },

    recoverPictures: pictureIds => {
        set(state => {
            // 원본 사진 배열 복사

            const updatedRawPictures = [...state.rawPictures]
            console.log(updatedRawPictures)
            // 복구할 사진들의 속성 변경
            pictureIds.forEach(pictureId => {
                const pictureIndex = updatedRawPictures.findIndex(p => p.pictureId === pictureId)

                if (pictureIndex !== -1) {
                    // 해당 사진의 isDuplicated와 isShaky 속성을 false로 설정
                    updatedRawPictures[pictureIndex] = {
                        ...updatedRawPictures[pictureIndex],
                        isDuplicated: false,
                        isShaky: false,
                    }
                }
                console.log(updatedRawPictures[pictureIndex])
            })

            return { rawPictures: updatedRawPictures }
        })

        // 카테고라이징 다시 실행하여 모든 컬렉션 업데이트
        get().categorizePhotos()
    },

    // 특정 속성만 복구하는 함수들 (옵션)
    recoverFromShaky: pictureIds => {
        set(state => {
            const updatedRawPictures = [...state.rawPictures]

            pictureIds.forEach(pictureId => {
                const pictureIndex = updatedRawPictures.findIndex(p => p.pictureId === pictureId)

                if (pictureIndex !== -1) {
                    // isShaky 속성만 false로 설정
                    updatedRawPictures[pictureIndex] = {
                        ...updatedRawPictures[pictureIndex],
                        isShaky: false,
                    }
                }
            })

            return { rawPictures: updatedRawPictures }
        })

        get().categorizePhotos()
    },

    recoverFromDuplicated: pictureIds => {
        set(state => {
            const updatedRawPictures = [...state.rawPictures]

            pictureIds.forEach(pictureId => {
                const pictureIndex = updatedRawPictures.findIndex(p => p.pictureId === pictureId)

                if (pictureIndex !== -1) {
                    // isDuplicated 속성만 false로 설정
                    updatedRawPictures[pictureIndex] = {
                        ...updatedRawPictures[pictureIndex],
                        isDuplicated: false,
                    }
                }
            })

            return { rawPictures: updatedRawPictures }
        })

        get().categorizePhotos()
    },

    // 컬렉션 가져오기 함수 (선택기 역할)
    getCollectionByName: collectionName => {
        const state = get()

        if (collectionName === '전체') return state.allCollection
        if (collectionName === '흔들림') return state.shakyCollection
        if (collectionName === '중복') return state.duplicatedCollection

        // 태그 컬렉션에서 찾기
        const tagCollection = state.tagCollections.find(c => c.name === collectionName)
        if (tagCollection) return tagCollection

        // 클러스터 컬렉션에서 찾기
        return state.clusterCollections.find(c => (c.alt ? c.alt : c.name) === collectionName)
    },

    getClusterCollections: () => {
        return get().clusterCollections
    },

    // 특정 클러스터 ID로 컬렉션 가져오기
    getClusterById: clusterId => {
        const { clusterCollections } = get()
        return clusterCollections.find(cluster => cluster.clusterId === clusterId)
    },

    // 클러스터 컬렉션 업데이트 (이름 변경 등)
    updateClusterCollection: (clusterId, updates) => {
        set(state => {
            const updatedClusterCollections = state.clusterCollections.map(cluster =>
                cluster.clusterId === clusterId ? { ...cluster, ...updates } : cluster
            )

            return { clusterCollections: updatedClusterCollections }
        })
    },
    // 모든 컬렉션 초기화
    resetAllCollections: () =>
        set({
            currentAlbumId: null,
            rawPictures: [],
            allCollection: null,
            shakyCollection: null,
            duplicatedCollection: null,
            tagCollections: [],
            clusterCollections: [],
        }),
}))

export default useCollectionStore
