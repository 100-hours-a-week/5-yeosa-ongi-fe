
// services/fileValidation/validationService.js

import { ERROR_TYPES, FILE_STATUS, useFileProcessingStore } from '../../stores/fileProcessingStore.js';
import { createDefaultValidationPipeline } from './validationPipeline.js';

/**
 * 검증 서비스 클래스
 * Zustand 스토어와 검증 파이프라인을 연결하는 서비스 레이어
 */
export class ValidationService {
    constructor(options = {}) {
        this.pipeline = options.pipeline || createDefaultValidationPipeline(options);
        this.store = useFileProcessingStore;
    }

    /**
     * 스토어의 PENDING 상태 파일들을 검증
     */
    async validatePendingFiles() {
        const store = this.store.getState();
        const pendingFiles = store.getFilesByStatus(FILE_STATUS.PENDING);

        if (pendingFiles.length === 0) {
            return { success: true, message: '검증할 파일이 없습니다.' };
        }

        // 전체 상태를 검증 중으로 변경
        store.setProcessingStatus('validating');
        store.updateProgress('validation', 0, pendingFiles.length);

        try {
            // 모든 PENDING 파일을 VALIDATING 상태로 변경
            const updates = pendingFiles.map(file => ({
                fileId: file.id,
                status: FILE_STATUS.VALIDATING
            }));
            store.updateMultipleFileStatus(updates);

            // 검증 옵션 준비
            const validationOptions = {
                ...store.config,
                onProgress: (current, total, result) => {
                    store.updateProgress('validation', current, total);

                    // 개별 파일 상태 즉시 업데이트
                    const newStatus = result.isValid ? FILE_STATUS.VALID : FILE_STATUS.INVALID;
                    const updateData = {
                        validationResult: result,
                        errors: result.isValid ? [] : result.results
                            .filter(r => r.result === 'fail')
                            .map(r => ({ message: r.message, code: r.code }))
                    };

                    store.updateFileStatus(result.file.id || pendingFiles[current - 1].id, newStatus, updateData);
                }
            };

            // 실제 파일 배열 추출
            const fileObjects = pendingFiles.map(fileItem => fileItem.originalFile || fileItem.file);

            // 검증 실행
            const validationResult = await this.pipeline.validateFiles(fileObjects, validationOptions);

            // 최종 진행률 업데이트
            store.updateProgress('validation', validationResult.total, validationResult.total);

            // 검증 완료 상태로 변경
            store.setProcessingStatus('completed');

            // 에러 요약 생성 및 추가
            this.processValidationErrors(validationResult);

            return {
                success: true,
                result: validationResult,
                message: `검증 완료: ${validationResult.validCount}개 성공, ${validationResult.invalidCount}개 실패`
            };

        } catch (error) {
            console.error('검증 중 오류 발생:', error);

            // 에러 상태로 변경
            store.setProcessingStatus('error');
            store.addError({
                type: ERROR_TYPES.VALIDATION,
                message: `검증 중 오류가 발생했습니다: ${error.message}`,
                details: error
            });

            // 모든 VALIDATING 파일을 ERROR 상태로 변경
            const validatingFiles = store.getFilesByStatus(FILE_STATUS.VALIDATING);
            const errorUpdates = validatingFiles.map(file => ({
                fileId: file.id,
                status: FILE_STATUS.ERROR,
                data: {
                    error: error.message,
                    errors: [{ message: error.message, code: 'VALIDATION_SYSTEM_ERROR' }]
                }
            }));
            store.updateMultipleFileStatus(errorUpdates);

            return {
                success: false,
                error: error.message,
                message: '검증 중 오류가 발생했습니다.'
            };
        }
    }

    /**
     * 검증 에러 처리 및 스토어에 추가
     */
    processValidationErrors(validationResult) {
        const store = this.store.getState();

        // 전체 요약 에러 추가
        if (validationResult.invalidCount > 0) {
            const errorSummary = Object.entries(validationResult.summary.errors)
                .map(([code, count]) => `${this.getErrorCodeMessage(code)}: ${count}개`)
                .join(', ');

            store.addError({
                type: ERROR_TYPES.VALIDATION,
                message: `${validationResult.invalidCount}개 파일이 검증에 실패했습니다. (${errorSummary})`,
                level: 'error',
                fileCount: validationResult.invalidCount
            });
        }

        // 경고 있는 경우 추가
        if (validationResult.warningCount > 0) {
            store.addError({
                type: ERROR_TYPES.VALIDATION,
                message: `${validationResult.warningCount}개 파일에 경고가 있습니다. 확인 후 진행하세요.`,
                level: 'warning',
                fileCount: validationResult.warningCount
            });
        }
    }

    /**
     * 에러 코드를 사용자 친화적인 메시지로 변환
     */
    getErrorCodeMessage(code) {
        const messages = {
            'FILE_NOT_FOUND': '파일 없음',
            'INVALID_TYPE': '지원되지 않는 형식',
            'FILE_TOO_LARGE': '파일 크기 초과',
            'FILE_TOO_SMALL': '파일 크기 부족',
            'INVALID_DIMENSIONS': '해상도 문제',
            'CORRUPTED_FILE': '손상된 파일',
            'UNSUPPORTED_FORMAT': '지원되지 않는 형식'
        };
        return messages[code] || '알 수 없는 오류';
    }

    /**
     * 특정 파일 재검증
     */
    async revalidateFile(fileId) {
        const store = this.store.getState();
        const file = store.files.find(f => f.id === fileId);

        if (!file) {
            throw new Error('파일을 찾을 수 없습니다.');
        }

        // 파일을 VALIDATING 상태로 변경
        store.updateFileStatus(fileId, FILE_STATUS.VALIDATING);

        try {
            const validationOptions = { ...store.config };
            const result = await this.pipeline.validateFile(file.originalFile || file.file, validationOptions);

            // 결과에 따라 상태 업데이트
            const newStatus = result.isValid ? FILE_STATUS.VALID : FILE_STATUS.INVALID;
            const updateData = {
                validationResult: result,
                errors: result.isValid ? [] : result.results
                    .filter(r => r.result === 'fail')
                    .map(r => ({ message: r.message, code: r.code }))
            };

            store.updateFileStatus(fileId, newStatus, updateData);

            return { success: true, result };

        } catch (error) {
            store.updateFileStatus(fileId, FILE_STATUS.ERROR, {
                error: error.message,
                errors: [{ message: error.message, code: 'REVALIDATION_ERROR' }]
            });

            throw error;
        }
    }

    /**
     * 검증 설정 업데이트
     */
    updateValidationConfig(newConfig) {
        const store = this.store.getState();
        store.updateConfig(newConfig);

        // 필요한 경우 파이프라인도 재구성
        if (newConfig.enableDimensionCheck !== undefined ||
            newConfig.enableIntegrityCheck !== undefined) {
            this.pipeline = createDefaultValidationPipeline({
                enableDimensionCheck: newConfig.enableDimensionCheck,
                enableIntegrityCheck: newConfig.enableIntegrityCheck,
                stopOnFirstFailure: newConfig.stopOnFirstFailure
            });
        }
    }
}

/**
 * 기본 검증 서비스 인스턴스 생성
 */
export const createValidationService = (options = {}) => {
    return new ValidationService(options);
};