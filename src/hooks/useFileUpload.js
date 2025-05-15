import { useEffect, useState } from "react";

/**
 * 파일 업로드를 관리하는 커스텀 훅 - 단순화 버전
 * @param {Object} options 파일 업로드 옵션
 * @param {number} options.maxFiles 최대 파일 수 (기본값: 10)
 * @returns {Object} 파일 관리 객체와 메서드
 */
const useFileUpload = (options = {}) => {
    const { maxFiles = 10 } = options;
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [isProcessing, setProcessing] = useState(false);

    /**
     * 파일을 추가하는 함수 - 초과분은 무시하고 최대한도까지만 추가
     * @param {File|File[]} newFiles 추가할 파일(들)
     * @returns {boolean} 성공 여부
     */
    const addFile = (newFiles) => {
        if (!newFiles) return false;

        // 배열이 아닌 경우 배열로 변환
        const filesToAdd = Array.isArray(newFiles) ? newFiles : [newFiles];
        if (filesToAdd.length === 0) return false;

        // 현재 파일 수 + 추가할 파일 수가 최대 파일 수를 초과하는지 확인
        const totalFiles = files.length + filesToAdd.length;

        if (totalFiles <= maxFiles) {
            // 최대 파일 수를 초과하지 않는 경우, 모든 파일 추가
            const newFileItems = filesToAdd.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                id: Math.random().toString(36).substr(2, 9),
            }));

            setFiles(prevFiles => [...prevFiles, ...newFileItems]);
            setError(null);
            return true;
        } else {
            // 최대 파일 수를 초과하는 경우, 최대한도까지만 추가
            const remainingSlots = Math.max(0, maxFiles - files.length);

            if (remainingSlots > 0) {
                // 추가 가능한 파일만 추가
                const filesToKeep = filesToAdd.slice(0, remainingSlots);
                const newFileItems = filesToKeep.map(file => ({
                    file,
                    preview: URL.createObjectURL(file),
                    id: Math.random().toString(36).substr(2, 9),
                }));

                setFiles(prevFiles => [...prevFiles, ...newFileItems]);

                // 초과분 정보만 오류 메시지로 표시
                const excludedCount = filesToAdd.length - remainingSlots;
                setError(`최대 ${maxFiles}장까지만 업로드할 수 있습니다. ${excludedCount}장이 제외되었습니다.`);
            } else {
                // 슬롯이 없는 경우 모든 파일이 제외됨
                setError(`이미 최대 파일 수(${maxFiles}장)에 도달했습니다. ${filesToAdd.length}장이 추가되지 않았습니다.`);
            }

            return remainingSlots > 0; // 일부라도 추가되었으면 true 반환
        }
    };

    /**
     * 파일을 제거하는 함수
     * @param {string} fileId 제거할 파일 ID
     */
    const removeFile = (fileId) => {
        const fileToRemove = files.find(item => item.id === fileId);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.preview); // 메모리 누수 방지
        }
        setFiles(files.filter(item => item.id !== fileId));

        // 파일이 제거되면 error 초기화
        setError(null);
    };

    /**
     * 모든 파일을 초기화하는 함수
     */
    const clearFiles = () => {
        files.forEach(fileItem => {
            URL.revokeObjectURL(fileItem.preview);
        });
        setFiles([]);
        setError(null);
    };

    // 컴포넌트 언마운트 시 메모리 정리
    useEffect(() => {
        return () => {
            files.forEach(fileItem => {
                URL.revokeObjectURL(fileItem.preview);
            });
        };
    }, []);

    return {
        files,
        addFile,
        removeFile,
        clearFiles,
        error,
        isFull: files.length >= maxFiles,
        count: files.length,
        maxFiles,
        isProcessing,
        setProcessing
    };
};

export default useFileUpload;