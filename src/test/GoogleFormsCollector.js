import { API_BASE_URL } from "@/api/config";

/**
 * Google Forms 데이터 수집 모듈 (브라우저 정보 포함)
 * 사용자 파일 업로드 정보를 Google Forms로 자동 전송
 */
class GoogleFormsCollector {
    constructor(config) {
        this.formId = config.formId;
        this.entryIds = config.entryIds;
        this.isActive = config.isActive ?? true;
        this.debugMode = config.debugMode ?? false;

        // Google Forms 전송 URL 생성
        this.submitUrl = `https://docs.google.com/forms/d/e/${this.formId}/formResponse`;

        // 브라우저 정보 캐싱 (한 번만 분석)
        this.browserInfo = this.getBrowserInfo();

        if (this.debugMode) {
            console.log('GoogleFormsCollector 초기화됨:', this.submitUrl);
            console.log('브라우저 정보:', this.browserInfo);
        }
    }

    /**
     * 파일 분석 및 데이터 수집
     */
    async collectFileData(file) {
        if (!this.isActive) {
            if (this.debugMode) console.log('데이터 수집이 비활성화됨');
            return null;
        }

        try {
            const fileData = {
                // 파일 정보
                fileType: file.type || 'unknown',
                fileSize: file.size,
                fileName: file.name,
                actualFormat: await this.detectActualFormat(file),
                hasGPS: await this.checkGPSMetadata(file),

                // 디바이스 정보
                deviceType: this.getDeviceType(),

                // 브라우저 정보
                browserName: this.browserInfo.name,
                browserVersion: this.browserInfo.version,
                browserEngine: this.browserInfo.engine,

                // 시스템 정보
                operatingSystem: this.browserInfo.os,
                isMobile: this.browserInfo.isMobile,

                // 메타 정보
                timestamp: new Date().toISOString(),
                envelope: API_BASE_URL,
                sessionId: this.getSessionId(),

                // 화면 정보
                screenResolution: `${screen.width}x${screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`
            };

            // Google Forms로 전송
            await this.submitToGoogleForms(fileData);

            // 로컬 카운터 증가
            this.incrementTodayCount();

            if (this.debugMode) {
                console.log('데이터 수집 완료:', fileData);
            }

            return fileData;

        } catch (error) {
            console.error('데이터 수집 중 오류:', error);
            return null;
        }
    }

    /**
     * 상세한 브라우저 정보 분석
     */
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browserName = 'Unknown';
        let browserVersion = 'Unknown';
        let browserEngine = 'Unknown';
        let operatingSystem = 'Unknown';
        let isMobile = false;

        // 브라우저 감지
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            browserName = 'Chrome';
            const match = userAgent.match(/Chrome\/([0-9.]+)/);
            browserVersion = match ? match[1] : 'Unknown';
            browserEngine = 'Blink';
        } else if (userAgent.includes('Firefox')) {
            browserName = 'Firefox';
            const match = userAgent.match(/Firefox\/([0-9.]+)/);
            browserVersion = match ? match[1] : 'Unknown';
            browserEngine = 'Gecko';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browserName = 'Safari';
            const match = userAgent.match(/Version\/([0-9.]+)/);
            browserVersion = match ? match[1] : 'Unknown';
            browserEngine = 'WebKit';
        } else if (userAgent.includes('Edg')) {
            browserName = 'Edge';
            const match = userAgent.match(/Edg\/([0-9.]+)/);
            browserVersion = match ? match[1] : 'Unknown';
            browserEngine = 'Blink';
        } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
            browserName = 'Opera';
            const match = userAgent.match(/(Opera|OPR)\/([0-9.]+)/);
            browserVersion = match ? match[2] : 'Unknown';
            browserEngine = 'Blink';
        }

        // 운영체제 감지
        if (userAgent.includes('Windows')) {
            operatingSystem = 'Windows';
            if (userAgent.includes('Windows NT 10.0')) operatingSystem = 'Windows 10/11';
            else if (userAgent.includes('Windows NT 6.3')) operatingSystem = 'Windows 8.1';
            else if (userAgent.includes('Windows NT 6.2')) operatingSystem = 'Windows 8';
            else if (userAgent.includes('Windows NT 6.1')) operatingSystem = 'Windows 7';
        } else if (userAgent.includes('Mac OS X')) {
            operatingSystem = 'macOS';
            const match = userAgent.match(/Mac OS X ([0-9_]+)/);
            if (match) {
                const version = match[1].replace(/_/g, '.');
                operatingSystem = `macOS ${version}`;
            }
        } else if (userAgent.includes('Linux')) {
            operatingSystem = 'Linux';
        } else if (userAgent.includes('Android')) {
            operatingSystem = 'Android';
            const match = userAgent.match(/Android ([0-9.]+)/);
            if (match) operatingSystem = `Android ${match[1]}`;
            isMobile = true;
        } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            const match = userAgent.match(/OS ([0-9_]+)/);
            if (match) {
                const version = match[1].replace(/_/g, '.');
                operatingSystem = userAgent.includes('iPad') ? `iPadOS ${version}` : `iOS ${version}`;
            } else {
                operatingSystem = userAgent.includes('iPad') ? 'iPadOS' : 'iOS';
            }
            isMobile = true;
        }

        // 모바일 추가 감지
        if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(userAgent)) {
            isMobile = true;
        }

        return {
            name: browserName,
            version: browserVersion,
            engine: browserEngine,
            os: operatingSystem,
            isMobile: isMobile,
            userAgent: userAgent
        };
    }

    /**
     * Google Forms로 데이터 전송
     */
    async submitToGoogleForms(data) {
        const formData = new FormData();

        // Entry ID와 데이터 매핑
        formData.append(this.entryIds.fileType, data.fileType);
        formData.append(this.entryIds.fileSize, data.fileSize.toString());
        formData.append(this.entryIds.deviceType, data.deviceType);
        formData.append(this.entryIds.hasGPS, data.hasGPS ? 'Yes' : 'No');
        formData.append(this.entryIds.actualFormat, data.actualFormat);
        formData.append(this.entryIds.timestamp, data.timestamp);
        formData.append(this.entryIds.envelope, data.envelope);

        // 브라우저 정보 추가
        formData.append(this.entryIds.browserName, data.browserName);
        formData.append(this.entryIds.browserVersion, data.browserVersion);
        formData.append(this.entryIds.browserEngine, data.browserEngine);
        formData.append(this.entryIds.operatingSystem, data.operatingSystem);
        formData.append(this.entryIds.isMobile, data.isMobile ? 'Yes' : 'No');
        formData.append(this.entryIds.screenResolution, data.screenResolution);
        formData.append(this.entryIds.viewportSize, data.viewportSize);

        try {
            // no-cors 모드로 전송 (CORS 에러 방지)
            await fetch(this.submitUrl, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });

            if (this.debugMode) {
                console.log('Google Forms 전송 완료');
            }

        } catch (error) {
            console.error('Google Forms 전송 실패:', error);
            // 실패해도 사용자 경험에는 영향 없음
            this.saveToLocalBackup(data);
        }
    }

    /**
     * 전송 실패 시 로컬 백업
     */
    saveToLocalBackup(data) {
        try {
            const backup = JSON.parse(localStorage.getItem('forms_backup') || '[]');
            backup.push(data);

            // 최대 100개까지만 보관
            if (backup.length > 100) {
                backup.splice(0, backup.length - 100);
            }

            localStorage.setItem('forms_backup', JSON.stringify(backup));

            if (this.debugMode) {
                console.log('로컬 백업 저장됨');
            }
        } catch (error) {
            console.error('로컬 백업 실패:', error);
        }
    }

    /**
     * 실제 파일 형식 감지 (파일 헤더 분석)
     */
    async detectActualFormat(file) {
        try {
            const buffer = await file.slice(0, 12).arrayBuffer();
            const bytes = new Uint8Array(buffer);

            // JPEG
            if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
                return 'jpeg';
            }

            // PNG
            if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
                return 'png';
            }

            // HEIC/HEIF
            if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
                if (bytes[8] === 0x68 && bytes[9] === 0x65 && bytes[10] === 0x69 && bytes[11] === 0x63) {
                    return 'heic';
                }
            }

            // WebP
            if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) {
                return 'webp';
            }

            return 'unknown';

        } catch (error) {
            console.error('파일 형식 감지 실패:', error);
            return 'error';
        }
    }

    /**
     * GPS 메타데이터 확인 (간단한 EXIF 체크)
     */
    async checkGPSMetadata(file) {
        try {
            // JPEG 파일만 간단히 체크
            if (!file.type.includes('jpeg') && !file.name.toLowerCase().includes('.jpg')) {
                return false;
            }

            const buffer = await file.slice(0, 65536).arrayBuffer(); // 첫 64KB만 읽기
            const bytes = new Uint8Array(buffer);

            // EXIF GPS 태그 존재 여부 간단 체크 (0x8825 = GPS 태그)
            for (let i = 0; i < bytes.length - 1; i++) {
                if (bytes[i] === 0x88 && bytes[i + 1] === 0x25) {
                    return true;
                }
            }

            return false;

        } catch (error) {
            console.error('GPS 메타데이터 확인 실패:', error);
            return false;
        }
    }

    /**
     * 디바이스 타입 감지
     */
    getDeviceType() {
        const userAgent = navigator.userAgent;

        if (/iPhone/.test(userAgent)) {
            return 'iPhone';
        } else if (/iPad/.test(userAgent)) {
            return 'iPad';
        } else if (/iPod/.test(userAgent)) {
            return 'iPod';
        } else if (/Android/.test(userAgent)) {
            if (/Mobile/.test(userAgent)) {
                return 'Android_Phone';
            } else {
                return 'Android_Tablet';
            }
        } else if (/Mobile/.test(userAgent)) {
            return 'Mobile_Other';
        } else {
            return 'Desktop';
        }
    }

    /**
     * 세션 ID 생성/조회
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('experiment_session_id');

        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('experiment_session_id', sessionId);
        }

        return sessionId;
    }

    /**
     * 데이터 수집 활성화/비활성화
     */
    setActive(isActive) {
        this.isActive = isActive;
        if (this.debugMode) {
            console.log('데이터 수집', isActive ? '활성화' : '비활성화');
        }
    }

    /**
     * 로컬 통계 확인 (디버그용)
     */
    getLocalStats() {
        const stats = {
            collectedToday: this.getTodayCollectionCount(),
            sessionId: this.getSessionId(),
            isActive: this.isActive,
            browserInfo: this.browserInfo,
            backupCount: this.getBackupCount()
        };

        return stats;
    }

    getTodayCollectionCount() {
        const today = new Date().toDateString();
        const key = `collected_${today}`;
        const count = localStorage.getItem(key) || '0';
        return parseInt(count);
    }

    incrementTodayCount() {
        const today = new Date().toDateString();
        const key = `collected_${today}`;
        const count = parseInt(localStorage.getItem(key) || '0') + 1;
        localStorage.setItem(key, count.toString());
    }

    getBackupCount() {
        try {
            const backup = JSON.parse(localStorage.getItem('forms_backup') || '[]');
            return backup.length;
        } catch {
            return 0;
        }
    }

    /**
     * 백업 데이터 재전송 시도
     */
    async retryBackupData() {
        try {
            const backup = JSON.parse(localStorage.getItem('forms_backup') || '[]');

            if (backup.length === 0) {
                if (this.debugMode) console.log('백업 데이터 없음');
                return;
            }

            let successCount = 0;
            const remainingBackup = [];

            for (const data of backup) {
                try {
                    await this.submitToGoogleForms(data);
                    successCount++;
                } catch {
                    remainingBackup.push(data);
                }
            }

            localStorage.setItem('forms_backup', JSON.stringify(remainingBackup));

            if (this.debugMode) {
                console.log(`백업 재전송: ${successCount}/${backup.length} 성공`);
            }

        } catch (error) {
            console.error('백업 재전송 실패:', error);
        }
    }
}

export default GoogleFormsCollector;
