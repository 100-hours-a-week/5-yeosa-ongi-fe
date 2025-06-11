
import { changeClusterTitle } from '@/api/album'
import { useEffect, useState } from 'react'
import TextInput from '../common/TextInput'

const Cluster = ({ cluster, albumId, onNameChange }) => {
    const [style, setStyle] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const [newName, setNewName] = useState(cluster.clusterName)
    const [originalName, setOriginalName] = useState(cluster.clusterName)
    const [isLoading, setSaveLoading] = useState(false)

    const handleEditClick = () => {
        setIsEditing(true)
        setNewName(cluster.clusterName)
        setOriginalName(cluster.clusterName)
        setIsValid(false) // 편집 시작할 때 초기화
    }

    const handleChange = (newValue, e, inputIsValid) => {
        setNewName(newValue)
        // TextInput의 유효성 검사 결과를 그대로 사용하지 않고
        // 실제 값으로 직접 검증
        const validation = clusterNameValidation(newValue)
        setIsValid(validation.isValid)
    }

    const handleKeyDown = e => {
        if (e.key === 'Enter') {
            // 엔터 키 누를 때 한번 더 검증
            const validation = clusterNameValidation(newName)
            if (validation.isValid && !isLoading) {
                handleSave()
            }
        } else if (e.key === 'Escape') {
            handleCancel()
        }
    }

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
        // 저장 전 최종 검증
        const validation = clusterNameValidation(newName)
        if (!validation.isValid || isLoading) {
            setIsValid(validation.isValid)
            return
        }

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
        setIsValid(false)
    }

    // TextInput의 검증 상태 변경 핸들러
    const handleValidationChange = state => {
        // TextInput의 검증 결과를 받지만, 우리의 검증 로직을 우선시
        const validation = clusterNameValidation(state.value)
        setIsValid(validation.isValid)
    }

    // 외부 클릭으로 편집 모드 종료
    const handleBlur = e => {
        // 저장/취소 버튼 클릭이 아닌 경우에만 취소
        if (!e.currentTarget.contains(e.relatedTarget)) {
            // 약간의 지연을 두어 다른 이벤트가 먼저 처리되도록 함
            setTimeout(() => {
                handleCancel()
            }, 100)
        }
    }

    // TextInput의 onBlur 핸들러
    const handleInputBlur = () => {
        // 입력 필드에서 포커스가 나갈 때 최종 검증
        const validation = clusterNameValidation(newName)
        setIsValid(validation.isValid)
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

    // 편집 모드 시작할 때 초기 검증
    useEffect(() => {
        if (isEditing) {
            const validation = clusterNameValidation(newName)
            setIsValid(validation.isValid)
        }
    }, [isEditing, newName, originalName])

    return (
        <div className='flex flex-col items-center space-y-3 cursor-pointer group'>
            <div className='relative p-1 rounded-full bg-gradient-to-tr from-[#F3D0D7] to-[#F3D0D7]'>
                <div className='bg-white rounded-full'>
                    <div className='relative' style={style} />
                </div>
            </div>

            <div className='text-center max-w-20 sm:max-w-24'>
                {isEditing ? (
                    <div className='relative flex items-center justify-center' onBlur={handleBlur}>
                        <TextInput
                            value={newName}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onBlur={handleInputBlur}
                            className='text-xs text-center border-0 border-b rounded-none w-14 border-gray-light focus:border-b-1 focus:outline-none'
                            autoFocus
                            maxLength={5}
                            showCharacterCount={false}
                            validationFunction={clusterNameValidation}
                            onValidationChange={handleValidationChange}
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
