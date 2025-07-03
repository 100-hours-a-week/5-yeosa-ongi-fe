import { FC } from 'react'

export interface ImageProps {
    src: string
    webp?: string // WebP 버전
    width: number // 실제 이미지 크기
    height: number // 실제 이미지 크기
    alt: string
}

export interface GridItem {
    ElementType: FC<any> | React.ComponentType<any>
    element: number
    id?: string
    props?: {
        [key: string]: any
        imageProps?: ImageProps
    }
}

export interface OptimizedImageProps extends ImageProps {
    className?: string
    loading?: 'lazy' | 'eager'
}

export interface Picture {
    id: string | number
    url: string
    name?: string
}

export interface RawPicture {
    pictureId: string
    tag: string
    isDuplicated: boolean
    isShaky: boolean
    pictureURL: string
}
