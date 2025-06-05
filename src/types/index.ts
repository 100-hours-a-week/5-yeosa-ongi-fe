import { FC } from 'react'

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

export interface GridItem {
    ElementType: FC
    element: number
    id?: string
    props?: {}
}
