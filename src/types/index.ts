import { FC } from 'react'

export interface GridItem {
    ElementType: FC<any> | React.ComponentType<any>
    element: number
    id?: string
    props?: {}
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
