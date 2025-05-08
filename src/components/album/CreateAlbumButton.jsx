const CreateAlbumButton = ({ disabled, onClick }) => (
  <button
    className={`
      fixed left-0 right-0 bottom-0
      mx-4 mb-4
      h-14 w-auto
      text-lg font-bold z-50
      rounded-xl
      shadow-lg
      ${!disabled
        ? 'bg-primary text-white'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
      }
    `}
    style={{ maxWidth: "calc(100vw - 2rem)" }} // 혹시 너무 넓어질 때 대비
    disabled={disabled}
    onClick={onClick}
  >
    앨범 생성하기
  </button>
);

export default CreateAlbumButton;