import defaultProfileImage from '@/assets/default_user_imgae.png'
import icon_pencil from '@/assets/icons/icon_pencil.png'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import Icon from '@/components/common/Icon'
import { useGetPreSignedUrl } from '@/hooks/useAlbum'
import { useLogout } from '@/hooks/useAuth'
import { useUpdateUserInfo } from '@/hooks/useUser'
import axios from 'axios'
import ConfirmModal from '../components/common/ConfirmModal'
import Header from '../components/common/Header'
import { Modal } from '../components/common/Modal'
import TextInput from '../components/common/TextInput'
import ImageInput from '../components/MyPage/ImageInput'
import useModal from '../hooks/useModal'
import useAuthStore from '../stores/authStore'

const MyPage = () => {
    const navigate = useNavigate()

    // 사용자 정보 상태
    const [userInfo, setUserInfo] = useState({
        userId: null,
        profileImageURL: null,
        nickname: '사용자',
    })
    const logoutMutation = useLogout()

    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [nickname, setNickname] = useState('')
    const [profileImageFile, setProfileImageFile] = useState(null)
    const [previewImageURL, setPreviewImageURL] = useState(null)
    const [isUploading, setIsUploading] = useState(false)

    const refreshToken = useAuthStore(state => state.refreshToken)
    const getUserId = useAuthStore(state => state.getUserId)
    const getUser = useAuthStore(state => state.user)
    const setUser = useAuthStore(state => state.setUser)
    const getRefreshToken = useAuthStore(state => state.getRefreshToken)
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    const logout = useAuthStore(state => state.logout)

    const [inputValue, setInputValue] = useState(userInfo.nickname)
    const [isValid, setIsValid] = useState(false)

    const getPreSignedUrl = useGetPreSignedUrl()
    const updateUserInfo = useUpdateUserInfo()
    const { isOpen, modalData, openModal, closeModal } = useModal()

    useEffect(() => {
        setIsLoading(true)
        try {
            // 1. 먼저 스토어에서 인증 상태 확인
            if (isAuthenticated) {
                const user = getUser
                if (user && user.userId) {
                    const updatedInfo = {
                        userId: user.userId,
                        profileImageURL: user.profileImageURL || null,
                        nickname: user.nickname || '사용자',
                    }
                    setUserInfo(updatedInfo)
                    setNickname(updatedInfo.nickname)
                    // 프로필 이미지 URL이 있으면 미리보기에도 설정
                    if (updatedInfo.profileImageURL) {
                        setPreviewImageURL(updatedInfo.profileImageURL)
                    }
                }
            } else {
                // 2. 스토어에 없으면 세션 스토리지 확인
                const userInfoRaw = sessionStorage.getItem('auth-storage')
                if (userInfoRaw) {
                    try {
                        const userInfoFromSession = JSON.parse(userInfoRaw)
                        if (userInfoFromSession && userInfoFromSession.state && userInfoFromSession.state.user) {
                            const user = userInfoFromSession.state.user
                            const updatedInfo = {
                                userId: user.userId,
                                profileImageURL: user.profileImageURL || null,
                                nickname: user.nickname || '사용자',
                            }
                            setUserInfo(updatedInfo)
                            setNickname(updatedInfo.nickname)
                            // 프로필 이미지 URL이 있으면 미리보기에도 설정
                            if (updatedInfo.profileImageURL) {
                                setPreviewImageURL(updatedInfo.profileImageURL)
                            }
                        } else {
                            throw new Error('세션 스토리지에 유효한 사용자 정보가 없습니다.')
                        }
                    } catch (error) {
                        console.error('세션 스토리지 파싱 오류:', error)
                        navigate('/login', { replace: true })
                        return
                    }
                } else {
                    navigate('/login', { replace: true })
                    return
                }
            }
        } catch (error) {
            console.error('사용자 정보 로딩 오류:', error)
        } finally {
            setIsLoading(false)
        }
    }, [navigate, isAuthenticated, getUser, getUserId])

    const handleEditClick = () => {
        setIsEditing(true)
    }

    // 세션 스토리지 업데이트 함수
    const updateSessionStorage = updatedUser => {
        try {
            const authStorageRaw = sessionStorage.getItem('auth-storage')
            if (authStorageRaw) {
                const authStorage = JSON.parse(authStorageRaw)
                if (authStorage && authStorage.state && authStorage.state.user) {
                    // 사용자 정보 업데이트
                    authStorage.state.user = {
                        ...authStorage.state.user,
                        ...updatedUser,
                    }
                    // 업데이트된 정보를 세션 스토리지에 저장
                    sessionStorage.setItem('auth-storage', JSON.stringify(authStorage))
                    console.log('세션 스토리지 업데이트 완료')
                }
            }
        } catch (error) {
            console.error('세션 스토리지 업데이트 오류:', error)
        }
    }

    // 닉네임 저장 핸들러
    const handleSave = async () => {
        // 입력값 검증
        if (!nickname.trim()) {
            alert('닉네임을 입력해주세요.')
            return
        }

        if (!isValid) {
            alert('유효하지 않은 닉네임입니다.')
            return
        }

        try {
            const userInfoBody = {
                nickname: nickname.trim(),
                profileImageURL: userInfo.profileImageURL,
            }

            // mutateAsync 사용하여 응답 받기
            const response = await updateUserInfo.mutateAsync({
                userId: userInfo.userId,
                userInfo: userInfoBody,
            })

            console.log('닉네임 업데이트 응답:', response)

            // 상태 업데이트
            const updatedUserInfo = {
                ...userInfo,
                nickname: nickname.trim(),
            }

            setUserInfo(updatedUserInfo)

            // 상태 관리 라이브러리 업데이트
            if (setUser) {
                setUser(updatedUserInfo)
            }

            // 세션 스토리지 업데이트
            updateSessionStorage(updatedUserInfo)

            setIsEditing(false)
            console.log('닉네임이 성공적으로 업데이트되었습니다:', nickname.trim())
        } catch (error) {
            console.error('닉네임 업데이트 오류:', error)
            alert('닉네임 업데이트에 실패했습니다. 다시 시도해주세요.')
        }
    }

    // 닉네임 변경 핸들러
    const handleChange = (newValue, e, isValid) => {
        setIsValid(isValid)
        setNickname(newValue)
    }

    // 엔터 키 처리
    const handleKeyDown = e => {
        if (!isValid) return
        if (e.key === 'Enter') {
            handleSave()
        }
    }

    const nicknameValidation = nickname => {
        // 빈 값 체크
        if (!nickname || nickname.trim() === '') {
            return { isValid: false, message: '닉네임을 입력해주세요.' }
        }

        // 길이 체크 (2자 ~ 12자)
        if (nickname.length < 2) {
            return {
                isValid: false,
                message: '닉네임은 최소 2자 이상이어야 합니다.',
            }
        }

        if (nickname.length > 12) {
            return {
                isValid: false,
                message: '닉네임은 최대 12자까지 가능합니다.',
            }
        }

        // 허용된 문자만 사용했는지 체크 (영어, 숫자, 언더바, 한글)
        const allowedPattern = /^[a-zA-Z0-9_가-힣]+$/
        if (!allowedPattern.test(nickname)) {
            return {
                isValid: false,
                message: '영어, 숫자, 언더바(_), 한글만 사용 가능합니다.',
            }
        }

        // 모든 검사 통과
        return { isValid: true, message: '사용 가능한 닉네임입니다.' }
    }
    // 파일명 정리 함수
    const sanitizeFileName = fileName => {
        // 현재 타임스탬프를 파일명에 추가하여 고유성 보장
        const timestamp = new Date().getTime()
        // 확장자 추출
        const extension = fileName.split('.').pop().toLowerCase()
        // 영문, 숫자, 하이픈만 포함하는 새 파일명 생성
        return `profile-${uuidv4(timestamp)}.${extension}`
    }

    // 프로필 이미지 선택 처리
    const handleProfileImageSelect = async file => {
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 선택할 수 있습니다.')
            return
        }
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            alert('파일 크기는 5MB 이하만 가능합니다.')
            return
        }

        setProfileImageFile(file)

        // 미리보기 URL 생성
        const previewURL = URL.createObjectURL(file)
        setPreviewImageURL(previewURL)

        await handleProfileImageUpload(file)
    }

    const handleLogout = () => {
        logoutMutation.mutate(refreshToken || undefined, {
            onSuccess: () => {
                logout()
                navigate('/login')
            },
            onError: () => {
                logout()
                navigate('/login')
            },
        })
    }

    // 안전한 이미지 로드 함수
    const loadImageWithHeaders = async signedUrl => {
        try {
            // Fetch로 이미지 데이터 가져오기 (헤더 포함)
            const response = await fetch(signedUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': file.type, // 파일 타입에 맞게 설정
                },
            })

            if (!response.ok) {
                throw new Error(`이미지 로드 실패: ${response.status} ${response.statusText}`)
            }

            // 응답에서 Blob 추출
            const blob = await response.blob()

            // Blob에서 객체 URL 생성
            const objectUrl = URL.createObjectURL(blob)

            return objectUrl
        } catch (error) {
            console.error('이미지 로드 오류:', error)
            throw error
        }
    }

    // WebP 변환 함수
    const convertImageToWebP = (file, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            // 이미 WebP인 경우 그대로 반환
            if (file.type === 'image/webp') {
                resolve(file)
                return
            }

            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()

            img.onload = () => {
                // 캔버스 크기 설정 (원본 크기 유지 또는 리사이징)
                canvas.width = img.width
                canvas.height = img.height

                // 고품질 렌더링 설정
                if (ctx) {
                    ctx.imageSmoothingEnabled = true
                    ctx.imageSmoothingQuality = 'high'

                    // 이미지 그리기
                    ctx.drawImage(img, 0, 0)

                    // WebP로 변환
                    canvas.toBlob(
                        blob => {
                            if (blob) {
                                // 원본 파일명에서 확장자를 .webp로 변경
                                const webpFileName = file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp')

                                const webpFile = new File([blob], webpFileName, {
                                    type: 'image/webp',
                                    lastModified: Date.now(),
                                })

                                resolve(webpFile)
                            } else {
                                reject(new Error('WebP 변환 실패'))
                            }
                        },
                        'image/webp',
                        quality
                    )
                } else {
                    reject(new Error('Canvas 컨텍스트 생성 실패'))
                }
            }

            img.onerror = () => {
                reject(new Error('이미지 로드 실패'))
            }

            // 파일을 이미지로 로드
            img.src = URL.createObjectURL(file)
        })
    }

    // 프로필 이미지 리사이징 함수 (선택사항)
    const resizeProfileImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()

            img.onload = () => {
                // 비율 유지하면서 리사이징
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)
                const newWidth = Math.round(img.width * ratio)
                const newHeight = Math.round(img.height * ratio)

                canvas.width = newWidth
                canvas.height = newHeight

                if (ctx) {
                    ctx.imageSmoothingEnabled = true
                    ctx.imageSmoothingQuality = 'high'
                    ctx.drawImage(img, 0, 0, newWidth, newHeight)

                    canvas.toBlob(
                        blob => {
                            if (blob) {
                                const resizedFileName = file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp')
                                const resizedFile = new File([blob], resizedFileName, {
                                    type: 'image/webp',
                                    lastModified: Date.now(),
                                })
                                resolve(resizedFile)
                            } else {
                                reject(new Error('이미지 리사이징 실패'))
                            }
                        },
                        'image/webp',
                        quality
                    )
                } else {
                    reject(new Error('Canvas 컨텍스트 생성 실패'))
                }
            }

            img.onerror = () => {
                reject(new Error('이미지 로드 실패'))
            }

            img.src = URL.createObjectURL(file)
        })
    }

    // 수정된 프로필 이미지 업로드 핸들러
    const handleProfileImageUpload = async file => {
        if (!file) return

        setIsUploading(true)
        try {
            console.log('원본 파일:', file.name, file.type, `${(file.size / 1024).toFixed(1)}KB`)

            // 1단계: WebP 변환 (+ 선택적 리사이징)
            let processedFile

            try {
                // 프로필 이미지는 보통 크기 제한이 있으므로 리사이징 + WebP 변환
                processedFile = await resizeProfileImage(file, 400, 400, 0.85)
                console.log(
                    '변환된 파일:',
                    processedFile.name,
                    processedFile.type,
                    `${(processedFile.size / 1024).toFixed(1)}KB`
                )

                // 파일 크기 절약 효과 출력
                const savings = (((file.size - processedFile.size) / file.size) * 100).toFixed(1)
                console.log(`파일 크기 절약: ${savings}%`)
            } catch (conversionError) {
                console.warn('WebP 변환 실패, 원본 파일 사용:', conversionError)
                processedFile = file
            }

            // 2단계: 파일명 정리 (WebP 확장자 반영)
            const cleanFileName = sanitizeFileName(processedFile.name)

            // 3단계: Pre-Signed URL 가져오기
            const response = await getPreSignedUrl.mutateAsync({
                pictures: [
                    {
                        pictureName: cleanFileName,
                        pictureType: processedFile.type, // 변환된 파일 타입 사용
                    },
                ],
            })

            console.log('Pre-signed URL 응답:', response)

            // 4단계: 응답에서 필요한 데이터 추출
            const presignedUrl = response.presignedFiles[0].presignedUrl
            const permanentImageUrl = response.presignedFiles[0].pictureURL || presignedUrl.split('?')[0]

            // 5단계: 변환된 파일을 S3에 업로드
            const uploadResponse = await axios.put(presignedUrl, processedFile, {
                headers: {
                    'Content-Type': processedFile.type, // WebP 타입 사용
                },
            })

            if (uploadResponse.status !== 200) {
                throw new Error(`파일 업로드 실패: ${uploadResponse.status} ${uploadResponse.statusText}`)
            }

            console.log('S3 업로드 완료 (WebP 형식)')

            // 6단계: API 호출하여 사용자 정보 업데이트
            const updateResult = await updateUserInfo.mutateAsync({
                userId: userInfo.userId,
                userInfo: {
                    nickname: userInfo.nickname,
                    profileImageURL: permanentImageUrl,
                },
            })

            console.log('사용자 정보 업데이트 결과:', updateResult)

            // 7단계: 상태 업데이트
            const updatedUserInfo = {
                ...userInfo,
                profileImageURL: updateResult.profileImageURL || permanentImageUrl,
            }

            setUserInfo(updatedUserInfo)

            if (setUser) {
                setUser(updatedUserInfo)
            }

            updateSessionStorage(updatedUserInfo)

            console.log('프로필 이미지가 WebP 형식으로 성공적으로 업데이트되었습니다.')

            // 성공 메시지 (선택사항)
            // alert('프로필 이미지가 업데이트되었습니다!')
        } catch (error) {
            console.error('프로필 이미지 업로드 오류:', error)
            alert('프로필 이미지 업로드에 실패했습니다. 다시 시도해주세요.')

            // 업로드 실패시 미리보기 초기화
            setPreviewImageURL(userInfo.profileImageURL)
        } finally {
            setIsUploading(false)
        }
    }
    return (
        <>
            <Header showButtons={false} />
            <div className='p-4 mt-20'>
                {isLoading ? (
                    <div className='flex items-center justify-center'>
                        <p>로딩 중...</p>
                    </div>
                ) : (
                    <div className='flex flex-col items-center'>
                        <ImageInput onFileSelect={handleProfileImageSelect} accept='image/*' id='profileImageInput'>
                            <img
                                src={previewImageURL || userInfo.profileImageURL || defaultProfileImage}
                                alt={`${userInfo.nickname || '사용자'}의 프로필 이미지`}
                                className={`w-24 h-24 rounded-full object-cover ${isUploading ? 'opacity-50' : ''}`}
                            />
                            {isUploading && (
                                <div className='absolute inset-0 flex items-center justify-center'>
                                    <svg
                                        className='w-8 h-8 text-white animate-spin'
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                    >
                                        <circle
                                            className='opacity-25'
                                            cx='12'
                                            cy='12'
                                            r='10'
                                            stroke='currentColor'
                                            strokeWidth='4'
                                        ></circle>
                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                </div>
                            )}
                        </ImageInput>

                        <div className='relative flex items-center justify-center mt-4'>
                            {isEditing ? (
                                <div className='flex items-center '>
                                    <TextInput
                                        value={nickname}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        className='font-bold text-center border-0 border-b rounded-none text-md border-gray-light w-60 focus:border-b-1 focus:outline-none'
                                        autoFocus
                                        maxLength={12}
                                        showCharacterCount={false}
                                        validationFunction={nicknameValidation}
                                        onValidationChange={state => setIsValid(state.isValid)}
                                    />
                                    <button
                                        onClick={handleSave}
                                        className='absolute p-1 px-2 py-1 ml-2 text-sm text-white transform -translate-y-1/2 rounded -right-8 top-1/2'
                                    >
                                        <Icon name='check' className='text-black' />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className='font-bold text-center text-md w-60'>{nickname}</h2>
                                    <button
                                        className='absolute p-1 transform -translate-y-1/2 -right-8 top-1/2'
                                        onClick={handleEditClick}
                                        aria-label='프로필 편집'
                                    >
                                        <img className='w-4 h-4' src={icon_pencil} alt='편집' />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className='w-full max-w-md mx-auto mt-10'>
                            {/* 메뉴 아이템 */}
                            <div className='rounded-lg shadow-sm bg-gray-50'>
                                <button
                                    className='flex items-center justify-between w-full px-6 py-4 text-gray-700 hover:bg-gray-100'
                                    onClick={() => navigate('/my-activities')}
                                >
                                    <div className='flex items-center'>
                                        <svg
                                            className='w-5 h-5 mr-3 text-gray-500'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                                            ></path>
                                        </svg>
                                        <span className='text-base'>내 활동</span>
                                    </div>
                                    <svg
                                        className='w-5 h-5 text-gray-400'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth='2'
                                            d='M9 5l7 7-7 7'
                                        ></path>
                                    </svg>
                                </button>

                                <button
                                    className='flex items-center justify-between w-full px-6 py-4 text-gray-700 hover:bg-gray-100'
                                    onClick={() => {
                                        window.open(
                                            'https://docs.google.com/forms/d/e/1FAIpQLSeoPcuQrShJo_cuy4lE2oW-V2P2gV9OHQhUrC9_nwlZE4QSaw/viewform',
                                            '_blank'
                                        )
                                    }}
                                >
                                    <div className='flex items-center'>
                                        <svg
                                            className='w-5 h-5 mr-3 text-gray-500'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                                            ></path>
                                        </svg>
                                        <span className='text-base'>문의하기</span>
                                    </div>
                                    <svg
                                        className='w-5 h-5 text-gray-400'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth='2'
                                            d='M9 5l7 7-7 7'
                                        ></path>
                                    </svg>
                                </button>

                                <button
                                    className='flex items-center justify-between w-full px-6 py-4 text-gray-700 hover:bg-gray-100'
                                    onClick={() => {
                                        openModal('로그아웃')
                                    }}
                                >
                                    <div className='flex items-center'>
                                        <svg
                                            className='w-5 h-5 mr-3 text-gray-500'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                                            ></path>
                                        </svg>
                                        <span className='text-base'>로그아웃</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/*Modal*/}
            <Modal isOpen={isOpen} onClose={closeModal} title={modalData}>
                {modalData && (
                    <ConfirmModal
                        title={modalData}
                        content={'로그아웃 하시겠습니까?'}
                        closeModal={closeModal}
                        handleConfirm={handleLogout}
                    />
                )}
            </Modal>
        </>
    )
}

export default MyPage
