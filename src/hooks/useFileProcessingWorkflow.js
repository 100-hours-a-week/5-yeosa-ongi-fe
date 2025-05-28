import { useCallback, useEffect, useMemo } from 'react';
import { useFileSelection } from './useFileSelection';
import { useFileValidation } from './useFileValidation';

/**
 * 파일 선택부터 검증까지의 전체 워크플로우를 관리하는 훅
 */
export const useFileProcessingWorkflow = (options = {}) => {
    const {
        autoValidate = true,  // 파일 선택 후 자동 검증
        validationOptions = {}
    } = options;

    // 개별 훅들 사용
    const fileSelection = useFileSelection();
    const fileValidation = useFileValidation(validationOptions);

    // 파일 선택 후 자동 검증
    useEffect(() => {
        if (autoValidate && fileValidation.canValidate && !fileValidation.isValidating) {
            const timer = setTimeout(() => {
                fileValidation.validateFiles().catch(error => {
                    console.error('자동 검증 실패:', error);
                });
            }, 500); // 500ms 지연 후 검증 시작

            return () => clearTimeout(timer);
        }
    }, [autoValidate, fileValidation.canValidate, fileValidation.isValidating]);

    // 통합 파일 선택 함수
    const handleFileSelection = useCallback(async (rawFiles) => {
        const selectionResult = fileSelection.selectFiles(rawFiles);

        if (!selectionResult.success) {
            return selectionResult;
        }

        // 자동 검증이 비활성화된 경우 수동으로 검증 시작
        if (!autoValidate && fileValidation.canValidate) {
            try {
                await fileValidation.validateFiles();
            } catch (error) {
                return {
                    success: false,
                    message: `파일 선택은 성공했지만 검증 중 오류가 발생했습니다: ${error.message}`
                };
            }
        }

        return selectionResult;
    }, [fileSelection.selectFiles, fileValidation.validateFiles, fileValidation.canValidate, autoValidate]);

    // 전체 상태 요약
    const workflowState = useMemo(() => {
        const { selectionState } = fileSelection;
        const { validationState, validationSummary } = fileValidation;

        // 현재 단계 결정
        let currentStep = 'selection';
        if (validationState.validatingCount > 0 || validationState.isValidating) {
            currentStep = 'validation';
        } else if (validationState.validCount > 0 && validationState.pendingCount === 0) {
            currentStep = 'completed';
        } else if (validationState.hasValidationErrors) {
            currentStep = 'error';
        }

        // 전체 진행률 계산
        const totalFiles = selectionState.totalFiles;
        const processedFiles = validationState.validCount + validationState.invalidCount + validationState.errorCount;
        const overallProgress = totalFiles > 0 ? Math.round((processedFiles / totalFiles) * 100) : 0;

        return {
            currentStep,
            overallProgress,
            totalFiles,

            // 각 단계별 상태
            selection: {
                ...selectionState,
                isComplete: selectionState.totalFiles > 0,
                message: fileSelection.selectionMessage
            },

            validation: {
                ...validationState,
                isComplete: validationState.validCount > 0 && validationState.pendingCount === 0,
                summary: validationSummary
            },

            // 다음 단계 진행 가능 여부
            canProceedToProcessing: validationState.canProceedToProcessing,

            // 전체 상태
            isIdle: currentStep === 'selection' && totalFiles === 0,
            isActive: currentStep !== 'selection' || totalFiles > 0,
            isComplete: currentStep === 'completed',
            hasErrors: validationState.hasValidationErrors,
            isProcessing: validationState.isValidating
        };
    }, [fileSelection, fileValidation]);

    // 워크플로우 재시작
    const restartWorkflow = useCallback(() => {
        fileSelection.clearAllFiles();
        fileValidation.clearErrors();
    }, [fileSelection.clearAllFiles, fileValidation.clearErrors]);

    return {
        // 전체 상태
        workflowState,

        // 개별 모듈 상태 (필요한 경우 직접 접근)
        fileSelection,
        fileValidation,

        // 통합 액션
        selectFiles: handleFileSelection,
        removeFile: fileSelection.removeFile,
        revalidateFile: fileValidation.revalidateFile,
        restartWorkflow,

        // 유틸리티
        isReady: workflowState.canProceedToProcessing,
        isEmpty: workflowState.isIdle,
        isWorking: workflowState.isProcessing
    };
};