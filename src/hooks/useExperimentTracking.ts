// hooks/useExperimentTracking.ts
import GoogleFormsCollector from '@/test/GoogleFormsCollector'
import { useCallback, useEffect, useRef } from 'react'

const formsConfig = {
    formId: '1FAIpQLSeLWK7zOu6XYtDl4pywQXFlUD_3k-7EzXBQH-yiIbJpDdCMuQ',
    entryIds: {
        fileType: 'entry.1716202563',
        fileSize: 'entry.610008318',
        deviceType: 'entry.10810630',
        hasGPS: 'entry.1397849372',
        actualFormat: 'entry.1020187793',
        timestamp: 'entry.1058046855',
        envelope: 'entry.1699197855',
        browserName: 'entry.1427661627',
        browserVersion: 'entry.996591108',
    },
    isActive: true || process.env.NODE_ENV === 'production',
    debugMode: true || process.env.NODE_ENV === 'development',
}

export const useExperimentTracking = () => {
    const collectorRef = useRef<GoogleFormsCollector | null>(null)

    useEffect(() => {
        if (!collectorRef.current) {
            collectorRef.current = new GoogleFormsCollector(formsConfig)
        }

        // 네트워크 재연결 시 백업 데이터 재전송
        const handleOnline = () => {
            collectorRef.current?.retryBackupData()
        }

        window.addEventListener('online', handleOnline)

        return () => {
            window.removeEventListener('online', handleOnline)
        }
    }, [])

    const trackFile = useCallback((file: File) => {
        if (collectorRef.current) {
            collectorRef.current.collectFileData(file).catch(err => {
                console.warn('실험 데이터 수집 실패:', err)
            })
        }
    }, [])

    const getStats = useCallback(() => {
        return collectorRef.current?.getLocalStats() || null
    }, [])

    return { trackFile, getStats }
}
