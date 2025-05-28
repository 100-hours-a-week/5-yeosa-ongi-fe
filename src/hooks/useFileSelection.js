import { useCallback, useMemo } from 'react';
import { useFileProcessingStore } from '../stores/fileProcessingStore.js';
/**
 * 파일 선택을 위한 커스텀 훅
 */
export const useFileSelection = () => {
    const {
        files,
        config,
        statistics,
        addFiles,
        removeFile,
        reset,
        canAddFiles,
        processingStatus
    } = useFileProcessingStore();

    // 파일 선택 핸들러
    const selectFiles = useCallback((rawFiles) => {
        if (!rawFiles || rawFiles.length === 0) {
            return { success: false, message: '선택된 파일이 없습니다.' };
        }

        if (!canAddFiles()) {
            return {
                success: false,
                message: `파일을 추가할 수 없습니다. (최대 ${config.maxFiles}장, 현재 처리 중: ${processingStatus})`
            };
        }

        try {
            const result = addFiles(rawFiles);
            return {
                success: true,
                added: result.added,
                excluded: result.excluded,
                message: result.excluded > 0
                    ? `${result.added}장 추가됨, ${result.excluded}장 제외됨`
                    : `${result.added}장 추가됨`
            };
        } catch (error) {
            console.error('파일 선택 중 오류:', error);
            return {
                success: false,
                message: `파일 선택 중 오류가 발생했습니다: ${error.message}`
            };
        }
    }, [addFiles, canAddFiles, config.maxFiles, processingStatus]);

    // 파일 제거 핸들러
    const removeSelectedFile = useCallback((fileId) => {
        try {
            removeFile(fileId);
            return { success: true, message: '파일이 제거되었습니다.' };
        } catch (error) {
            console.error('파일 제거 중 오류:', error);
            return { success: false, message: `파일 제거 중 오류가 발생했습니다: ${error.message}` };
        }
    }, [removeFile]);

    // 모든 파일 제거
    const clearAllFiles = useCallback(() => {
        try {
            reset();
            return { success: true, message: '모든 파일이 제거되었습니다.' };
        } catch (error) {
            console.error('파일 초기화 중 오류:', error);
            return { success: false, message: `파일 초기화 중 오류가 발생했습니다: ${error.message}` };
        }
    }, [reset]);

    // 선택 상태 정보
    const selectionState = useMemo(() => {
        const remainingSlots = Math.max(0, config.maxFiles - files.length);
        const isAtLimit = files.length >= config.maxFiles;
        const canSelect = canAddFiles();

        return {
            totalFiles: files.length,
            maxFiles: config.maxFiles,
            remainingSlots,
            isAtLimit,
            canSelect,
            usagePercentage: Math.round((files.length / config.maxFiles) * 100),
            statistics
        };
    }, [files.length, config.maxFiles, canAddFiles, statistics]);

    // 선택 상태 메시지
    const selectionMessage = useMemo(() => {
        const { totalFiles, maxFiles, remainingSlots, isAtLimit } = selectionState;

        if (isAtLimit) {
            return `최대 파일 수에 도달했습니다. (${totalFiles}/${maxFiles})`;
        }

        if (totalFiles === 0) {
            return `파일을 선택하세요. (최대 ${maxFiles}장)`;
        }

        return `${totalFiles}장 선택됨. ${remainingSlots}장 더 추가 가능`;
    }, [selectionState]);

    return {
        // 상태
        files,
        selectionState,
        selectionMessage,
        config,

        // 액션
        selectFiles,
        removeFile: removeSelectedFile,
        clearAllFiles,

        // 유틸리티
        canAddFiles: selectionState.canSelect,
        isAtLimit: selectionState.isAtLimit,
        isEmpty: files.length === 0
    };
};
