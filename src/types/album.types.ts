export interface ClusterInterface {
    clusterId: string
    clusterName: string
    representativePicture: string
    bboxX1: number
    bboxY1: number
    bboxX2: number
    bboxY2: number
    clusterPicture: string[]
}

export interface Picture {
    id: string | number
    url: string
    name?: string
}

export interface Category {
    name: string
    pictures: Picture[]
}

export interface AlbumData {
    id: string
    title?: string
}
