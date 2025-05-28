
import { useCallback, useEffect, useMemo, useRef } from 'react';


import { createValidationService } from '../services/\bfileValidation/validationService';
import { FILE_STATUS, useFileProcessingStore } from '../stores/fileProcessingStore';

/**
 * 파일 검증을 위한 커스텀 훅
 */
export const useFileValidation = (options = {}) => {
    const validationServiceRef = useRef(null);

    // Zustand 스토어 상태 구독
    const {
        files,
        processingStatus,
        config,
        errors,
        statistics,
        progress,
        updateConfig,
        getFilesByStatus,
        addError,
        removeError,
        clearErrors
    } = useFileProcessingStore();

    // 검증 서비스 초기화
    useEffect(() => {
        validationServiceRef.current = createValidationService({
            enableDimensionCheck: options.enableDimensionCheck || false,
            enableIntegrityCheck: options.enableIntegrityCheck || false,
            stopOnFirstFailure: options.stopOnFirstFailure || false,
            ...options
        });
    }, [options.enableDimensionCheck, options.enableIntegrityCheck, options.stopOnFirstFailure]);

    // 검증 실행
    const validateFiles = useCallback(async () => {
        if (!validationServiceRef.current) {
            throw new Error('검증 서비스가 초기화되지 않았습니다.');
        }

        try {
            const result = await validationServiceRef.current.validatePendingFiles();
            return result;
        } catch (error) {
            console.error('파일 검증 중 오류:', error);
            addError({
                type: 'validation',
                message: `검증 중 오류가 발생했습니다: ${error.message}`,
                details: error
            });
            throw error;
        }
    }, [addError]);

    // 특정 파일 재검증
    const revalidateFile = useCallback(async (fileId) => {
        if (!validationServiceRef.current) {
            throw new Error('검증 서비스가 초기화되지 않았습니다.');
        }

        try {
            const result = await validationServiceRef.current.revalidateFile(fileId);
            return result;
        } catch (error) {
            console.error('파일 재검증 중 오류:', error);
            addError({
                type: 'validation',
                message: `파일 재검증 중 오류가 발생했습니다: ${error.message}`,
                details: error
            });
            throw error;
        }
    }, [addError]);

    // 검증 설정 업데이트
    const updateValidationConfig = useCallback((newConfig) => {
        updateConfig(newConfig);
        if (validationServiceRef.current) {
            validationServiceRef.current.updateValidationConfig(newConfig);
        }
    }, [updateConfig]);

    // 계산된 상태들
    const validationState = useMemo(() => {
        const pendingFiles = getFilesByStatus(FILE_STATUS.PENDING);
        const validatingFiles = getFilesByStatus(FILE_STATUS.VALIDATING);
        const validFiles = getFilesByStatus(FILE_STATUS.VALID);
        const invalidFiles = getFilesByStatus(FILE_STATUS.INVALID);
        const errorFiles = getFilesByStatus(FILE_STATUS.ERROR);

        return {
            pendingCount: pendingFiles.length,
            validatingCount: validatingFiles.length,
            validCount: validFiles.length,
            invalidCount: invalidFiles.length,
            errorCount: errorFiles.length,

            pendingFiles,
            validatingFiles,
            validFiles,
            invalidFiles,
            errorFiles,

            isValidating: processingStatus === 'validating',
            hasValidationErrors: invalidFiles.length > 0 || errorFiles.length > 0,
            canStartValidation: pendingFiles.length > 0 && processingStatus === 'idle',
            canProceedToProcessing: validFiles.length > 0 && processingStatus === 'completed',

            validationProgress: progress.validation,
            validationErrors: errors.filter(error => error.type === 'validation')
        };
    }, [files, processingStatus, progress, errors, getFilesByStatus]);

    // 검증 상태 요약
    const validationSummary = useMemo(() => {
        const { validCount, invalidCount, errorCount } = validationState;
        const totalProcessed = validCount + invalidCount + errorCount;

        if (totalProcessed === 0) {
            return { message: '검증할 파일이 없습니다.', status: 'empty' };
        }

        if (invalidCount > 0 || errorCount > 0) {
            return {
                message: `${totalProcessed}개 파일 중 ${invalidCount + errorCount}개 실패`,
                status: 'has_errors'
            };
        }

        if (validCount > 0) {
            return {
                message: `${validCount}개 파일 검증 완료`,
                status: 'success'
            };
        }

        return { message: '검증 진행 중...', status: 'processing' };
    }, [validationState]);

    return {
        // 상태
        validationState,
        validationSummary,
        config,

        // 액션
        validateFiles,
        revalidateFile,
        updateValidationConfig,

        // 에러 관리
        clearErrors,
        removeError,

        // 유틸리티
        isValidating: validationState.isValidating,
        hasErrors: validationState.hasValidationErrors,
        canValidate: validationState.canStartValidation,
        canProceed: validationState.canProceedToProcessing
    };
};
