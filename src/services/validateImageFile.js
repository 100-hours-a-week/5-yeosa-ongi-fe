// src/services/fileValidationService.js

/**
 * 파일 검증 서비스
 * 이미지 파일의 유효성을 검사하는 함수들을 제공합니다.
 */

/**
 * 파일 크기 검증
 * @param {File} file - 검증할 파일 객체
 * @param {number} maxSize - 최대 허용 크기 (바이트 단위)
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateFileSize = (file, maxSize = 5 * 1024 * 1024) => {
    if (file.size > maxSize) {
        return {
            isValid: false,
            error: `파일 크기는 ${Math.floor(maxSize / (1024 * 1024))}MB 이하여야 합니다.`
        };
    }

    return { isValid: true, error: null };
};

/**
 * 파일 타입 검증
 * @param {File} file - 검증할 파일 객체
 * @param {Array} allowedTypes - 허용된 MIME 타입 배열
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: '지원되는 이미지 형식이 아닙니다.'
        };
    }

    return { isValid: true, error: null };
};

/**
 * 파일 갯수 검증
 * @param {Array} currentFiles - 현재 파일 목록
 * @param {number} maxFiles - 최대 허용 파일 수
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateFileCount = (currentFiles, maxFiles = 10) => {
    if (currentFiles.length >= maxFiles) {
        return {
            isValid: false,
            error: `최대 ${maxFiles}장까지만 업로드할 수 있습니다.`
        };
    }

    return { isValid: true, error: null };
};

/**
 * 종합 파일 검증
 * 크기, 타입, 갯수 등을 한 번에 검증합니다.
 * 
 * @param {File} file - 검증할 파일 객체
 * @param {Array} currentFiles - 현재 파일 목록
 * @param {object} options - 검증 옵션
 * @param {number} options.maxSize - 최대 파일 크기 (바이트)
 * @param {Array} options.allowedTypes - 허용된 MIME 타입 배열
 * @param {number} options.maxFiles - 최대 파일 개수
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateFile = (file, currentFiles, options = {}) => {
    const {
        maxSize = 5 * 1024 * 1024,
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
        maxFiles = 10
    } = options;

    // 파일 크기 검증
    const sizeResult = validateFileSize(file, maxSize);
    if (!sizeResult.isValid) {
        return sizeResult;
    }

    // 파일 타입 검증
    const typeResult = validateFileType(file, allowedTypes);
    if (!typeResult.isValid) {
        return typeResult;
    }

    // 파일 개수 검증
    const countResult = validateFileCount(currentFiles, maxFiles);
    if (!countResult.isValid) {
        return countResult;
    }

    return { isValid: true, error: null };
};

/**
 * 이미지 파일 기본 검증 함수
 * 기본 설정으로 종합 검증을 수행합니다.
 * 
 * @param {File} file - 검증할 파일 객체
 * @param {Array} currentFiles - 현재 파일 목록
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateImageFile = (file, currentFiles) => {
    return validateFile(file, currentFiles, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
        maxFiles: 10
    });
};

/**
 * 이미지 파일 목록 검증
 * 여러 파일을 한 번에 검증합니다.
 * 
 * @param {Array} files - 검증할 파일 객체 배열
 * @param {Array} currentFiles - 현재 파일 목록
 * @returns {object} - { isValid: boolean, error: string | null, validFiles: Array }
 */
export const validateImageFiles = (files, currentFiles) => {
    const validFiles = [];

    for (const file of files) {
        const result = validateImageFile(file, [...currentFiles, ...validFiles]);

        if (!result.isValid) {
            return {
                isValid: false,
                error: result.error,
                validFiles
            };
        }

        validFiles.push(file);
    }

    return {
        isValid: true,
        error: null,
        validFiles
    };
};