import { FC } from 'react'

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

export interface GridItem {
    ElementType: FC<any> | React.ComponentType<any>
    element: number
    id?: string
    props?: {}
}
