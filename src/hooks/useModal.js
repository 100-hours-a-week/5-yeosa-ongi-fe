import { useState } from 'react';

const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    const openModal = (content) => {
        setIsOpen(true);
        setModalContent(content);
    };

    const closeModal = () => {
        setIsOpen(false);
        setModalContent(null);
    };

    return { isOpen, modalContent, openModal, closeModal };
}

export default useModal;