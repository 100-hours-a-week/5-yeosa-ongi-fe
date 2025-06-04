import crossIcon from '../../assets/cross_icon.png'
import { FileItem } from '../../types/upload'

export const FilePreview = ({ file, onDelete }: { file: FileItem; onDelete: (fileId: string) => void }) => (
    <div className='relative w-full h-full'>
        <img src={file.preview} alt={`Preview ${file.id}`} className='absolute inset-0 object-cover w-full h-full' />
        <button className='absolute z-10 top-2 right-2' onClick={() => onDelete(file.id)}>
            <img className='w-4 h-4' src={crossIcon} alt='삭제' />
        </button>
    </div>
)
