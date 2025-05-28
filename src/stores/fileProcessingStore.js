import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 파일 상태 타입 정의
export const FILE_STATUS = {
    PENDING: 'pending',           // 선택되었지만 아직 처리되지 않음
    VALIDATING: 'validating',     // 검증 중
    VALID: 'valid',               // 검증 완료
    INVALID: 'invalid',           // 검증 실패
    PROCESSING: 'processing',     // 처리 중 (HEIC 변환, 메타데이터 추출 등)
    PROCESSED: 'processed',       // 처리 완료
    ERROR: 'error'                // 처리 중 오류
};

// 전체 처리 상태
export const PROCESSING_STATUS = {
    IDLE: 'idle',
    SELECTING: 'selecting',
    VALIDATING: 'validating',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    ERROR: 'error'
};

// 에러 타입 정의
export const ERROR_TYPES = {
    VALIDATION: 'validation',
    PROCESSING: 'processing',
    SYSTEM: 'system',
    NETWORK: 'network'
};

/**
 * 파일 처리를 위한 Zustand 스토어
 */
export const useFileProcessingStore = create(
    devtools(
        (set, get) => ({
            // === 상태 ===

            // 파일 목록 - 각 파일은 고유 ID와 상태를 가짐
            files: [],

            // 전체 처리 상태
            processingStatus: PROCESSING_STATUS.IDLE,

            // 처리 설정
            config: {
                maxFiles: 30,
                maxFileSize: 5 * 1024 * 1024, // 5MB
                allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/heic', 'image/heif'],
                autoProcess: true, // 검증 후 자동으로 처리할지 여부
            },

            // 에러 목록
            errors: [],

            // 통계 정보
            statistics: {
                total: 0,
                pending: 0,
                validating: 0,
                valid: 0,
                invalid: 0,
                processing: 0,
                processed: 0,
                error: 0,
                excluded: 0, // 최대 개수 초과로 제외된 파일 수
            },

            // 진행률 정보
            progress: {
                validation: { current: 0, total: 0 },
                processing: { current: 0, total: 0 }
            },

            // === 액션 ===

            /**
             * 설정 업데이트
             */
            updateConfig: (newConfig) => {
                set((state) => ({
                    config: { ...state.config, ...newConfig }
                }));
            },

            /**
             * 통계 계산 및 업데이트
             */
            updateStatistics: () => {
                const { files } = get();
                const statistics = files.reduce((acc, file) => {
                    acc.total++;
                    acc[file.status] = (acc[file.status] || 0) + 1;
                    return acc;
                }, {
                    total: 0,
                    pending: 0,
                    validating: 0,
                    valid: 0,
                    invalid: 0,
                    processing: 0,
                    processed: 0,
                    error: 0,
                    excluded: get().statistics.excluded // 기존 제외 수 유지
                });

                set({ statistics });
            },

            /**
             * 파일 상태 업데이트
             */
            updateFileStatus: (fileId, status, data = {}) => {
                set((state) => ({
                    files: state.files.map(file =>
                        file.id === fileId
                            ? { ...file, status, ...data, updatedAt: Date.now() }
                            : file
                    )
                }));

                // 통계 업데이트
                get().updateStatistics();
            },

            /**
             * 여러 파일 상태 일괄 업데이트
             */
            updateMultipleFileStatus: (updates) => {
                set((state) => ({
                    files: state.files.map(file => {
                        const update = updates.find(u => u.fileId === file.id);
                        return update
                            ? { ...file, status: update.status, ...update.data, updatedAt: Date.now() }
                            : file;
                    })
                }));

                get().updateStatistics();
            },

            /**
             * 에러 추가
             */
            addError: (error) => {
                const errorWithId = {
                    id: Date.now() + Math.random(),
                    timestamp: Date.now(),
                    type: ERROR_TYPES.SYSTEM,
                    ...error
                };

                set((state) => ({
                    errors: [...state.errors, errorWithId]
                }));
            },

            /**
             * 에러 제거
             */
            removeError: (errorId) => {
                set((state) => ({
                    errors: state.errors.filter(error => error.id !== errorId)
                }));
            },

            /**
             * 모든 에러 제거
             */
            clearErrors: () => {
                set({ errors: [] });
            },

            /**
             * 파일 추가 (초기 선택 단계)
             */
            addFiles: (rawFiles) => {
                const { config, files: currentFiles } = get();
                const filesArray = Array.isArray(rawFiles) ? rawFiles : [rawFiles];

                // 현재 파일 수 확인
                const availableSlots = Math.max(0, config.maxFiles - currentFiles.length);

                if (availableSlots === 0) {
                    get().addError({
                        type: ERROR_TYPES.VALIDATION,
                        message: `이미 최대 파일 수(${config.maxFiles}장)에 도달했습니다.`,
                        fileCount: filesArray.length
                    });
                    return { added: 0, excluded: filesArray.length };
                }

                // 추가할 파일과 제외할 파일 분리
                const filesToAdd = filesArray.slice(0, availableSlots);
                const excludedCount = filesArray.length - filesToAdd.length;

                // 파일 객체 생성
                const newFiles = filesToAdd.map((file, index) => ({
                    id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                    originalFile: file,
                    file: file, // 처리 과정에서 변경될 수 있음 (HEIC 변환 등)
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    status: FILE_STATUS.PENDING,
                    preview: null, // 나중에 생성
                    metadata: {}, // GPS, EXIF 등
                    errors: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }));

                set((state) => ({
                    files: [...state.files, ...newFiles],
                    processingStatus: PROCESSING_STATUS.SELECTING,
                    statistics: {
                        ...state.statistics,
                        excluded: state.statistics.excluded + excludedCount
                    }
                }));

                // 제외된 파일이 있으면 경고 추가
                if (excludedCount > 0) {
                    get().addError({
                        type: ERROR_TYPES.VALIDATION,
                        message: `최대 ${config.maxFiles}장까지만 업로드할 수 있습니다. ${excludedCount}장이 제외되었습니다.`,
                        level: 'warning'
                    });
                }

                get().updateStatistics();

                return { added: filesToAdd.length, excluded: excludedCount };
            },

            /**
             * 파일 제거
             */
            removeFile: (fileId) => {
                const { files } = get();
                const fileToRemove = files.find(f => f.id === fileId);

                if (fileToRemove) {
                    // 메모리 정리
                    if (fileToRemove.preview) {
                        URL.revokeObjectURL(fileToRemove.preview);
                    }

                    set((state) => ({
                        files: state.files.filter(f => f.id !== fileId)
                    }));

                    get().updateStatistics();
                }
            },

            /**
             * 모든 파일 제거 및 상태 초기화
             */
            reset: () => {
                const { files } = get();

                // 메모리 정리
                files.forEach(file => {
                    if (file.preview) {
                        URL.revokeObjectURL(file.preview);
                    }
                });

                set({
                    files: [],
                    processingStatus: PROCESSING_STATUS.IDLE,
                    errors: [],
                    statistics: {
                        total: 0,
                        pending: 0,
                        validating: 0,
                        valid: 0,
                        invalid: 0,
                        processing: 0,
                        processed: 0,
                        error: 0,
                        excluded: 0,
                    },
                    progress: {
                        validation: { current: 0, total: 0 },
                        processing: { current: 0, total: 0 }
                    }
                });
            },

            /**
             * 진행률 업데이트
             */
            updateProgress: (type, current, total) => {
                set((state) => ({
                    progress: {
                        ...state.progress,
                        [type]: { current, total }
                    }
                }));
            },

            /**
             * 전체 처리 상태 변경
             */
            setProcessingStatus: (status) => {
                set({ processingStatus: status });
            },

            // === 셀렉터 (계산된 값들) ===

            /**
             * 특정 상태의 파일들 가져오기
             */
            getFilesByStatus: (status) => {
                return get().files.filter(file => file.status === status);
            },

            /**
             * 처리 가능한 파일들 (valid 상태)
             */
            getProcessableFiles: () => {
                return get().files.filter(file => file.status === FILE_STATUS.VALID);
            },

            /**
             * 에러가 있는 파일들
             */
            getFilesWithErrors: () => {
                return get().files.filter(file =>
                    file.status === FILE_STATUS.INVALID ||
                    file.status === FILE_STATUS.ERROR ||
                    file.errors.length > 0
                );
            },

            /**
             * 처리 완료된 파일들
             */
            getProcessedFiles: () => {
                return get().files.filter(file => file.status === FILE_STATUS.PROCESSED);
            },

            /**
             * 전체 진행률 계산
             */
            getOverallProgress: () => {
                const { files } = get();
                if (files.length === 0) return 0;

                const processedCount = files.filter(file =>
                    file.status === FILE_STATUS.PROCESSED ||
                    file.status === FILE_STATUS.INVALID
                ).length;

                return Math.round((processedCount / files.length) * 100);
            },

            /**
             * 현재 상태가 처리 중인지 확인
             */
            isProcessing: () => {
                const status = get().processingStatus;
                return status === PROCESSING_STATUS.VALIDATING ||
                    status === PROCESSING_STATUS.PROCESSING;
            },

            /**
             * 새 파일 추가 가능 여부
             */
            canAddFiles: () => {
                const { files, config } = get();
                return files.length < config.maxFiles && !get().isProcessing();
            }
        }),
        {
            name: 'file-processing-store', // devtools에서 보이는 이름
        }
    )
);