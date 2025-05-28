import {
    createValidationResult,
    validateFileExists,
    validateFileSize,
    validateFileType,
    VALIDATION_RESULT
} from './validators';

export class ValidationPipeline {
    constructor(options = {}) {
        this.options = {
            enableDimensionCheck: false, // 차원 검증 활성화 여부
            enableIntegrityCheck: false, // 무결성 검증 활성화 여부
            stopOnFirstFailure: false,   // 첫 번째 실패 시 중단 여부
            ...options
        };

        this.validators = this.createValidatorPipeline();
    }

    /**
     * 검증기 파이프라인 생성
     */
    createValidatorPipeline() {
        const pipeline = [
            { name: 'existence', validator: validateFileExists, required: true },
            { name: 'type', validator: validateFileType, required: true },
            { name: 'size', validator: validateFileSize, required: true },
        ];

        if (this.options.enableDimensionCheck) {
            pipeline.push({
                name: 'dimensions',
                validator: validateImageDimensions,
                required: false
            });
        }

        if (this.options.enableIntegrityCheck) {
            pipeline.push({
                name: 'integrity',
                validator: validateFileIntegrity,
                required: false
            });
        }

        return pipeline;
    }

    /**
     * 단일 파일 검증
     */
    async validateFile(file, validationOptions = {}) {
        const results = [];
        let overallResult = VALIDATION_RESULT.PASS;
        let hasWarnings = false;

        for (const { name, validator, required } of this.validators) {
            try {
                const result = await validator(file, validationOptions);
                results.push({ validator: name, ...result });

                // 결과 평가
                if (result.result === VALIDATION_RESULT.FAIL) {
                    overallResult = VALIDATION_RESULT.FAIL;
                    if (this.options.stopOnFirstFailure && required) {
                        break;
                    }
                } else if (result.result === VALIDATION_RESULT.WARNING) {
                    hasWarnings = true;
                }
            } catch (error) {
                const errorResult = createValidationResult(
                    VALIDATION_RESULT.FAIL,
                    `검증 중 오류 발생: ${error.message}`,
                    'VALIDATION_ERROR',
                    { validator: name, error: error.message }
                );

                results.push({ validator: name, ...errorResult });
                overallResult = VALIDATION_RESULT.FAIL;

                if (this.options.stopOnFirstFailure && required) {
                    break;
                }
            }
        }

        // 최종 결과 결정
        if (overallResult === VALIDATION_RESULT.PASS && hasWarnings) {
            overallResult = VALIDATION_RESULT.WARNING;
        }

        return {
            file,
            overallResult,
            results,
            isValid: overallResult !== VALIDATION_RESULT.FAIL,
            hasWarnings: hasWarnings || overallResult === VALIDATION_RESULT.WARNING,
            timestamp: Date.now()
        };
    }

    /**
     * 여러 파일 일괄 검증
     */
    async validateFiles(files, validationOptions = {}) {
        const results = [];
        const validFiles = [];
        const invalidFiles = [];
        const warnings = [];

        // 진행률 콜백
        const onProgress = validationOptions.onProgress || (() => { });
        const total = files.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            try {
                const result = await this.validateFile(file, validationOptions);
                results.push(result);

                if (result.isValid) {
                    validFiles.push({ file, result });
                    if (result.hasWarnings) {
                        warnings.push(result);
                    }
                } else {
                    invalidFiles.push({ file, result });
                }

                // 진행률 업데이트
                onProgress(i + 1, total, result);

            } catch (error) {
                const errorResult = {
                    file,
                    overallResult: VALIDATION_RESULT.FAIL,
                    results: [createValidationResult(
                        VALIDATION_RESULT.FAIL,
                        `검증 중 예상치 못한 오류: ${error.message}`,
                        'UNEXPECTED_ERROR',
                        { error: error.message }
                    )],
                    isValid: false,
                    hasWarnings: false,
                    timestamp: Date.now()
                };

                results.push(errorResult);
                invalidFiles.push({ file, result: errorResult });
            }
        }

        return {
            total: files.length,
            validCount: validFiles.length,
            invalidCount: invalidFiles.length,
            warningCount: warnings.length,
            validFiles: validFiles.map(item => item.file),
            invalidFiles: invalidFiles.map(item => item.file),
            results,
            validResults: validFiles,
            invalidResults: invalidFiles,
            warnings,
            summary: this.generateSummary(results)
        };
    }

    /**
     * 검증 결과 요약 생성
     */
    generateSummary(results) {
        const summary = {
            total: results.length,
            passed: 0,
            failed: 0,
            warnings: 0,
            errors: {}
        };

        results.forEach(result => {
            if (result.isValid) {
                summary.passed++;
                if (result.hasWarnings) {
                    summary.warnings++;
                }
            } else {
                summary.failed++;

                // 에러 타입별 집계
                result.results.forEach(validationResult => {
                    if (validationResult.result === VALIDATION_RESULT.FAIL && validationResult.code) {
                        summary.errors[validationResult.code] = (summary.errors[validationResult.code] || 0) + 1;
                    }
                });
            }
        });

        return summary;
    }
}

/**
 * 기본 검증 파이프라인 인스턴스 생성 함수
 */
export const createDefaultValidationPipeline = (options = {}) => {
    return new ValidationPipeline({
        enableDimensionCheck: false,
        enableIntegrityCheck: false,
        stopOnFirstFailure: false,
        ...options
    });
};

/**
 * 엄격한 검증 파이프라인 (모든 검증 활성화)
 */
export const createStrictValidationPipeline = (options = {}) => {
    return new ValidationPipeline({
        enableDimensionCheck: true,
        enableIntegrityCheck: true,
        stopOnFirstFailure: false,
        ...options
    });
};

/**
 * 빠른 검증 파이프라인 (필수 검증만, 첫 실패시 중단)
 */
export const createFastValidationPipeline = (options = {}) => {
    return new ValidationPipeline({
        enableDimensionCheck: false,
        enableIntegrityCheck: false,
        stopOnFirstFailure: true,
        ...options
    });
};
