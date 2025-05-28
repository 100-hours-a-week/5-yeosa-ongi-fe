// services/fileValidation/validators.js

/**
 * 개별 검증기 함수들
 * 각 검증기는 async 함수이며, ValidationResult를 반환합니다.
 */

// 검증 결과 타입
export const VALIDATION_RESULT = {
    PASS: 'pass',
    FAIL: 'fail',
    WARNING: 'warning'
};

// 검증 에러 코드
export const VALIDATION_ERROR_CODES = {
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    INVALID_TYPE: 'INVALID_TYPE',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    FILE_TOO_SMALL: 'FILE_TOO_SMALL',
    INVALID_DIMENSIONS: 'INVALID_DIMENSIONS',
    CORRUPTED_FILE: 'CORRUPTED_FILE',
    UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT'
};

/**
 * 검증 결과 생성 헬퍼
 */
export const createValidationResult = (result, message = '', code = null, data = {}) => ({
    result,
    message,
    code,
    data,
    timestamp: Date.now()
});

/**
 * 파일 존재성 검증
 */
export const validateFileExists = async (file, options = {}) => {
    if (!file) {
        return createValidationResult(
            VALIDATION_RESULT.FAIL,
            '파일이 존재하지 않습니다.',
            VALIDATION_ERROR_CODES.FILE_NOT_FOUND
        );
    }

    if (!(file instanceof File)) {
        return createValidationResult(
            VALIDATION_RESULT.FAIL,
            '유효하지 않은 파일 객체입니다.',
            VALIDATION_ERROR_CODES.FILE_NOT_FOUND
        );
    }

    return createValidationResult(VALIDATION_RESULT.PASS, '파일이 존재합니다.');
};

/**
 * 파일 타입 검증
 */
export const validateFileType = async (file, options = {}) => {
    const {
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/heic', 'image/heif'],
        allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.heic', '.heif']
    } = options;

    // MIME 타입 체크
    const mimeTypeValid = allowedTypes.includes(file.type);

    // 확장자 체크 (MIME 타입이 비어있거나 신뢰할 수 없는 경우를 위한 fallback)
    const fileName = file.name.toLowerCase();
    const extensionValid = allowedExtensions.some(ext => fileName.endsWith(ext));

    // HEIC 파일 특별 처리 (브라우저에서 MIME 타입을 제대로 인식하지 못할 수 있음)
    const isHeicFile = fileName.endsWith('.heic') || fileName.endsWith('.heif') ||
        file.type === 'image/heic' || file.type === 'image/heif';

    if (isHeicFile) {
        return createValidationResult(
            VALIDATION_RESULT.PASS,
            'HEIC/HEIF 파일입니다. JPG로 변환됩니다.',
            null,
            { needsConversion: true, targetType: 'image/jpeg' }
        );
    }

    if (!mimeTypeValid && !extensionValid) {
        return createValidationResult(
            VALIDATION_RESULT.FAIL,
            `지원되지 않는 파일 형식입니다. 지원 형식: ${allowedExtensions.join(', ')}`,
            VALIDATION_ERROR_CODES.INVALID_TYPE,
            { detectedType: file.type, fileName: file.name }
        );
    }

    // MIME 타입과 확장자가 일치하지 않는 경우 경고
    if (mimeTypeValid && !extensionValid) {
        return createValidationResult(
            VALIDATION_RESULT.WARNING,
            '파일 확장자와 MIME 타입이 일치하지 않습니다.',
            null,
            { detectedType: file.type, fileName: file.name }
        );
    }

    return createValidationResult(VALIDATION_RESULT.PASS, '파일 형식이 유효합니다.');
};

/**
 * 파일 크기 검증
 */
export const validateFileSize = async (file, options = {}) => {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB
        minSize = 1024 // 1KB
    } = options;

    if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

        return createValidationResult(
            VALIDATION_RESULT.FAIL,
            `파일 크기가 너무 큽니다. (${fileSizeMB}MB > ${maxSizeMB}MB)`,
            VALIDATION_ERROR_CODES.FILE_TOO_LARGE,
            { fileSize: file.size, maxSize, fileSizeMB, maxSizeMB }
        );
    }

    if (file.size < minSize) {
        const minSizeKB = (minSize / 1024).toFixed(1);
        const fileSizeKB = (file.size / 1024).toFixed(1);

        return createValidationResult(
            VALIDATION_RESULT.FAIL,
            `파일 크기가 너무 작습니다. (${fileSizeKB}KB < ${minSizeKB}KB)`,
            VALIDATION_ERROR_CODES.FILE_TOO_SMALL,
            { fileSize: file.size, minSize, fileSizeKB, minSizeKB }
        );
    }

    // 큰 파일에 대한 경고 (예: 3MB 이상)
    const warningSize = maxSize * 0.6; // maxSize의 60%
    if (file.size > warningSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        return createValidationResult(
            VALIDATION_RESULT.WARNING,
            `파일 크기가 큽니다. (${fileSizeMB}MB) 업로드 시간이 오래 걸릴 수 있습니다.`,
            null,
            { fileSize: file.size, fileSizeMB }
        );
    }

    return createValidationResult(VALIDATION_RESULT.PASS, '파일 크기가 적절합니다.');
};

/**
 * 이미지 파일 시그니처 확인 헬퍼 함수
 */
const checkImageSignature = (uint8Array, mimeType) => {
    if (uint8Array.length < 4) return false;

    const signatures = {
        'image/jpeg': [[0xFF, 0xD8, 0xFF]],
        'image/png': [[0x89, 0x50, 0x4E, 0x47]],
        'image/gif': [[0x47, 0x49, 0x46, 0x38]],
        'image/webp': [[0x57, 0x45, 0x42, 0x50]], // "WEBP"
    };

    const expectedSignatures = signatures[mimeType];
    if (!expectedSignatures) return true; // 알 수 없는 타입은 통과

    return expectedSignatures.some(signature =>
        signature.every((byte, index) => uint8Array[index] === byte)
    );
};