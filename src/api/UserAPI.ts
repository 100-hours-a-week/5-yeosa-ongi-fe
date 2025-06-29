// UserAPI.ts
import { User } from '@/types/auth.types'
import APIBuilder from './core/APIBuilder'

// 사용자 통계 관련 타입 정의
export interface UserStatistics {
    totalRecords: number
    totalPhotos: number
    totalPlaces: number
    // 필요한 다른 통계 필드들 추가
}

export interface UserActivity {
    date: string
    count: number
    tags?: string[]
    // 활동 관련 필드들
}

export interface PictureStatistic {
    yearMonth: string
    totalCount: number
    // 사진 통계 관련 필드들
}

export interface PlaceStatistic {
    yearMonth: string
    places: Array<{
        name: string
        count: number
        coordinates?: { lat: number; lng: number }
    }>
    // 장소 통계 관련 필드들
}

export class UserAPI {
    // 유저 정보 업데이트
    static updateUserInfo(userId: string, userInfo: Partial<User>) {
        return APIBuilder.put(`/api/user/${userId}`, userInfo).requiresAuth(true).build().call<User>()
    }

    // 전체 통계 조회
    static getTotalStatistics() {
        return APIBuilder.get('/api/user/statistics').requiresAuth(true).build().call<UserStatistics>()
    }

    // 사용자 활동 조회 (월별)
    static getUserActivities(yearMonth: string) {
        return APIBuilder.get('/api/user/statistics/tag')
            .params({ yearMonth })
            .requiresAuth(true)
            .build()
            .call<UserActivity[]>()
    }

    // 사진 통계 조회
    static getPictureStatistics(yearMonth: string) {
        return APIBuilder.get('/api/user/statistics/picture')
            .params({ yearMonth })
            .requiresAuth(true)
            .build()
            .call<PictureStatistic>()
    }

    // 장소 통계 조회
    static getPlaceStatistics(yearMonth: string) {
        return APIBuilder.get('/api/user/statistics/place')
            .params({ yearMonth })
            .requiresAuth(true)
            .build()
            .call<PlaceStatistic>()
    }
}
