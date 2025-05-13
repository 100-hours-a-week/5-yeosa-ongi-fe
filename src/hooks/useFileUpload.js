import { useState } from "react";

const useFileUpload = () => {
    const [files, setFiles] = useState([]);

    const addFile = (file) => {
        if (!file) return;
        const newFileItem = {
            file,
            preview: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9),
        };
        setFiles((prevFiles) => [...prevFiles, newFileItem]);
    };

    const removeFile = (fileId) => {
        const fileToRemove = files.find(item => item.id === fileId);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.preview); // 메모리 누수 방지
        }
        setFiles(files.filter(item => item.id !== fileId));
    };

    useEffect(() => {
        return () => {
            files.forEach(fileItem => {
                URL.revokeObjectURL(fileItem.preview);
            });
        };
    }, []);

    return { files, addFile, removeFile };
};

export default useFileUpload;