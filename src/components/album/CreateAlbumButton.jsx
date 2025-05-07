import React from "react";

const CreateAlbumButton = ({ disabled, onClick }) => (
  <button
    className={`fixed left-0 bottom-0 w-full h-14 text-lg font-bold z-50 ${
      !disabled
        ? 'bg-primary text-white'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
    }`}
    disabled={disabled}
    onClick={onClick}
  >
    앨범 생성하기
  </button>
);

export default CreateAlbumButton; 