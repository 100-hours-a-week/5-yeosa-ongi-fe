import { changeClusterTitle } from '@/api/album'
import { useEffect, useState } from 'react'
import TextInput from '../common/TextInput'

const Cluster = ({ cluster, albumId, onNameChange }) => {
    const [style, setStyle] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const [newName, setNewName] = useState(cluster.clusterName) // 새 이름 상태 추가
    const [originalName, setOriginalName] = useState(cluster.clusterName) // 원래 이름 저장
    const [isLoading, setSaveLoading] = useState(false) // 저장 로딩 상태

    const handleEditClick = () => {
        setIsEditing(true)
        setNewName(cluster.clusterName)
        setOriginalName(cluster.clusterName)
    }

    const handleChange = (newValue, e, isValid) => {
        setIsValid(isValid)
        setNewName(newValue)
    }

    // 엔터 키 처리
    const handleKeyDown = e => {
        if (e.key === 'Enter' && isValid && !isLoading) {
            handleSave()
        } else if (e.key === 'Escape') {
            handleCancel()
        }
    }

    // 유효성 검사 함수 개선
    const clusterNameValidation = value => {
        if (!value || value.trim().length === 0) {
            return { isValid: false, message: '이름을 입력해주세요.' }
        }
        if (value.trim().length > 5) {
            return { isValid: false, message: '5자 이내로 입력해주세요.' }
        }
        if (value.trim() === originalName.trim()) {
            return { isValid: false, message: '기존 이름과 동일합니다.' }
        }
        return { isValid: true, message: '' }
    }

    const handleSave = async () => {
        if (!isValid || isLoading) return

        setSaveLoading(true)

        try {
            const trimmedName = newName.trim()
            const response = await changeClusterTitle(albumId, cluster.clusterId, trimmedName)

            // API 응답 확인
            if (response && response.success) {
                setIsEditing(false)
                // 부모 컴포넌트에 변경사항 알림
                onNameChange?.(cluster.clusterId, trimmedName)
            } else {
                throw new Error(response?.message || '이름 변경에 실패했습니다.')
            }
        } catch (error) {
            console.error('클러스터 이름 변경 실패:', error)
        } finally {
            setSaveLoading(false)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setNewName(originalName)
    }

    // 외부 클릭으로 편집 모드 종료
    const handleBlur = e => {
        // 저장/취소 버튼 클릭이 아닌 경우에만 취소
        if (!e.currentTarget.contains(e.relatedTarget)) {
            handleCancel()
        }
    }

    useEffect(() => {
        const img = new Image()
        img.src = cluster.clusterPicture[0]
        img.onload = () => {
            const { naturalWidth, naturalHeight } = img

            // 원래 bbox
            let bboxX1 = cluster.bboxX1
            let bboxY1 = cluster.bboxY1
            let bboxX2 = cluster.bboxX2
            let bboxY2 = cluster.bboxY2

            const bboxWidth = bboxX2 - bboxX1
            const bboxHeight = bboxY2 - bboxY1

            const paddingRatio = 0.1

            const padX = bboxWidth * paddingRatio
            const padY = bboxHeight * paddingRatio

            bboxX1 = Math.max(0, bboxX1 - padX)
            bboxY1 = Math.max(0, bboxY1 - padY)
            bboxX2 = Math.min(naturalWidth, bboxX2 + padX)
            bboxY2 = Math.min(naturalHeight, bboxY2 + padY)

            const paddedWidth = bboxX2 - bboxX1
            const paddedHeight = bboxY2 - bboxY1

            const scale = Math.min(64 / paddedWidth, 64 / paddedHeight)

            const backgroundWidth = naturalWidth * scale
            const backgroundHeight = naturalHeight * scale

            const centerX = (bboxX1 + bboxX2) / 2
            const centerY = (bboxY1 + bboxY2) / 2

            const offsetX = centerX * scale - 32
            const offsetY = centerY * scale - 32

            setStyle({
                backgroundImage: `url(${cluster.clusterPicture[0]})`,
                backgroundSize: `${backgroundWidth}px ${backgroundHeight}px`,
                backgroundPosition: `-${offsetX}px -${offsetY}px`,
                width: '64px',
                height: '64px',
                borderRadius: '9999px',
                overflow: 'hidden',
                backgroundRepeat: 'no-repeat',
            })
        }
        img.onerror = () => {
            console.error('클러스터 이미지 로드 실패:', cluster.clusterPicture[0])
        }
    }, [cluster])

    // 클러스터 이름이 외부에서 변경된 경우 업데이트
    useEffect(() => {
        if (!isEditing) {
            setNewName(cluster.clusterName)
            setOriginalName(cluster.clusterName)
        }
    }, [cluster.clusterName, isEditing])

    return (
        <div className='flex flex-col items-center space-y-3 cursor-pointer group'>
            <div className='relative p-1 rounded-full bg-gradient-to-tr from-[#F3D0D7] to-[#F3D0D7]'>
                <div className='bg-white rounded-full'>
                    <div className='relative' style={style} />
                </div>
            </div>

            <div className='text-center max-w-20 sm:max-w-24'>
                {isEditing ? (
                    <div className='relative' onBlur={handleBlur}>
                        <TextInput
                            value={newName}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className='text-xs text-center border-0 border-b rounded-none w-14 border-gray-light focus:border-b-1 focus:outline-none'
                            autoFocus
                            maxLength={5}
                            showCharacterCount={false}
                            validationFunction={clusterNameValidation}
                            onValidationChange={state => {
                                setIsValid(state.isValid)
                            }}
                            disabled={isLoading}
                            reserveHelperSpace={false}
                        />
                    </div>
                ) : (
                    <button
                        className='w-full'
                        onClick={handleEditClick}
                        aria-label='클러스터 이름 편집'
                        disabled={isLoading}
                    >
                        <h2 className='text-xs leading-tight text-gray-800 transition-colors line-clamp-2 group-hover:text-gray-600'>
                            {cluster.clusterName}
                        </h2>
                    </button>
                )}
            </div>
        </div>
    )
}

export default Cluster
