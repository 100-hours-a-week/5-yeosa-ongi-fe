import { useState } from 'react';

const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    const openModal = (content) => {
        setIsOpen(true);
        setModalData(content);
    };

    const closeModal = () => {
        setIsOpen(false);
        setModalData(null);
    };

    return { isOpen, modalData, openModal, closeModal };
}

export default useModal;