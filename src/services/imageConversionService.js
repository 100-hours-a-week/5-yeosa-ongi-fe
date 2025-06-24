import heic2any from 'heic2any'

export const isHEICFile = file => {
    return (
        file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif')
    )
}

/**
 * HEIC/HEIF 파일을 JPG로 변환합니다.
 * @param {File} heicFile - 변환할 HEIC/HEIF 파일
 * @param {Object} options - 변환 옵션
 * @param {string} options.toType - 변환할 형식 (기본값: 'image/jpeg')
 * @param {number} options.quality - 이미지 품질 (0~1, 기본값: 0.8)
 * @returns {Promise<File|null>} 변환된 File 객체 또는 실패 시 null
 */
export const convertHEICtoJPG = async (heicFile, options = {}) => {
    const { toType = 'image/jpeg', quality = 0.8 } = options

    try {
        console.log('HEIC 파일 변환 시작:', heicFile.name)

        // HEIC 파일을 지정된 형식의 Blob으로 변환
        const convertedBlob = await heic2any({
            blob: heicFile,
            toType,
            quality,
        })

        // 결과가 배열인 경우 처리 (여러 이미지가 포함된 HEIC 파일의 경우)
        const resultBlob = Array.isArray(convertedBlob)
            ? convertedBlob[0]
            : convertedBlob

        // 확장자 결정
        let extension = '.jpg'
        if (toType === 'image/png') extension = '.png'
        else if (toType === 'image/webp') extension = '.webp'

        // 변환된 Blob을 File 객체로 변환
        const convertedFile = new File(
            [resultBlob],
            heicFile.name.replace(/\.heic$|\.heif$/i, extension),
            { type: toType }
        )

        console.log('HEIC 파일 변환 완료:', convertedFile.name)
        return convertedFile
    } catch (error) {
        console.error('HEIC 변환 오류:', error)
        return null
    }
}

/**
 * 파일 배열에서 HEIC/HEIF 파일을 모두 변환합니다.
 * @param {File[]} files - 처리할 파일 배열
 * @param {Object} options - 변환 옵션
 * @returns {Promise<{processedFiles: File[], failedFiles: File[]}>} 처리된 파일과 실패한 파일의 배열
 */
export const processImageFiles = async (files, options = {}) => {
    const processedFiles = []
    const failedFiles = []

    try {
        // HEIC 파일 변환이 필요한지 확인
        const hasHeicFiles = files.some(file => isHEICFile(file))

        if (hasHeicFiles) {
            console.log('HEIC 파일 감지됨, 변환 시작')

            // 각 파일을 처리
            for (const file of files) {
                if (isHEICFile(file)) {
                    console.log('HEIC 파일 변환 중:', file.name)
                    const convertedFile = await convertHEICtoJPG(file, options)

                    if (convertedFile) {
                        processedFiles.push(convertedFile)
                    } else {
                        console.error('파일 변환 실패:', file.name)
                        failedFiles.push(file)
                    }
                } else {
                    // 일반 이미지 파일은 그대로 추가
                    processedFiles.push(file)
                }
            }
        } else {
            // HEIC 파일이 없는 경우 모든 파일을 그대로 반환
            processedFiles.push(...files)
        }
    } catch (error) {
        console.error('이미지 처리 중 오류 발생:', error)
        // 처리하지 못한 파일을 failedFiles에 추가
        const processedFileNames = new Set(processedFiles.map(f => f.name))
        failedFiles.push(...files.filter(f => !processedFileNames.has(f.name)))
    }

    return { processedFiles, failedFiles }
}

/**
 * 이미지 파일의 크기를 조정합니다. (아직 구현되지 않음)
 * @param {File} file - 크기를 조정할 파일
 * @param {Object} options - 크기 조정 옵션
 * @returns {Promise<File>} 크기가 조정된 파일
 */
export const resizeImage = async (file, options = {}) => {
    // 이미지 크기 조정 로직 (필요시 구현)
    // Canvas API 또는 외부 라이브러리 사용 가능
    return file
}

/**
 * 이미지 파일 배열에 대한 일괄 처리를 수행합니다.
 * HEIC 변환, 크기 조정 등 다양한 처리를 순차적으로 적용
 *
 * @param {File[]} files - 처리할 파일 배열
 * @param {Object} options - 처리 옵션
 * @param {boolean} options.convertHeic - HEIC 변환 여부 (기본값: true)
 * @param {boolean} options.resize - 크기 조정 여부 (기본값: false)
 * @param {Object} options.heicOptions - HEIC 변환 옵션
 * @param {Object} options.resizeOptions - 크기 조정 옵션
 * @returns {Promise<{processedFiles: File[], failedFiles: File[]}>} 처리 결과
 */
export const batchProcessImages = async (files, options = {}) => {
    const {
        convertHeic = true,
        resize = false,
        heicOptions = {},
        resizeOptions = {},
    } = options

    let currentFiles = [...files]
    let allFailedFiles = []

    // HEIC 변환
    if (convertHeic) {
        const { processedFiles, failedFiles } = await processImageFiles(
            currentFiles,
            heicOptions
        )
        currentFiles = processedFiles
        allFailedFiles = [...allFailedFiles, ...failedFiles]
    }

    // 이미지 크기 조정 (필요시 구현)
    if (resize) {
        const resizedFiles = []
        const resizeFailedFiles = []

        for (const file of currentFiles) {
            try {
                const resizedFile = await resizeImage(file, resizeOptions)
                resizedFiles.push(resizedFile)
            } catch (error) {
                console.error('이미지 크기 조정 실패:', file.name, error)
                resizeFailedFiles.push(file)
            }
        }

        currentFiles = resizedFiles
        allFailedFiles = [...allFailedFiles, ...resizeFailedFiles]
    }

    return {
        processedFiles: currentFiles,
        failedFiles: allFailedFiles,
    }
}
