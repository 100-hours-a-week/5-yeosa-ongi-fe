import { Check, Edit2, Loader2, X } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

// TextField props 타입 (실제 TextField props와 동일하게)
interface TextFieldProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    disabled?: boolean
    error?: string
    label?: string
    defaultValue?: string
    required?: boolean
    maxLength?: number
    className?: string
    validator?: (value: string) => string | boolean | Promise<string | boolean>
    onValidationChange?: (result: { isValid: boolean; message?: string }) => void
    helperText?: string
    type?: string
    autoFocus?: boolean
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

interface EditableTextProps {
    // === 핵심 기능 ===
    value: string
    onSave: (newValue: string) => void | Promise<void>

    // === 편집 모드 제어 ===
    isEditing?: boolean // 외부에서 편집 모드 제어
    onEditingChange?: (isEditing: boolean) => void

    // === 표시 옵션 ===
    label?: string
    emptyText?: string // 값이 없을 때 표시할 텍스트

    // === 권한 및 동작 ===
    editable?: boolean
    saveOnBlur?: boolean
    saveOnEnter?: boolean
    cancelOnEscape?: boolean

    // === 스타일링 ===
    className?: string
    displayClassName?: string
    buttonsClassName?: string

    // === TextField에 전달할 props ===
    textFieldProps?: Omit<TextFieldProps, 'value' | 'onChange'>

    // === 커스텀 렌더링 ===
    renderDisplay?: (value: string, isEmpty: boolean) => React.ReactNode
    renderEditButton?: (onClick: () => void) => React.ReactNode
    renderActionButtons?: (onSave: () => void, onCancel: () => void, isSaving: boolean) => React.ReactNode
}

// TextField 컴포넌트 (실제로는 별도 파일에서 import)
const TextField: React.FC<TextFieldProps> = ({
    value,
    onChange,
    className = '',
    autoFocus,
    onBlur,
    onKeyDown,
    ...props
}) => {
    return (
        <input
            type='text'
            value={value || ''}
            onChange={e => onChange?.(e.target.value)}
            className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
            autoFocus={autoFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            {...props}
        />
    )
}

const EditableText: React.FC<EditableTextProps> = ({
    // 핵심 기능
    value,
    onSave,

    // 편집 모드 제어
    isEditing: externalIsEditing,
    onEditingChange,

    // 표시 옵션
    label,
    emptyText = '값이 없습니다',

    // 권한 및 동작
    editable = true,
    saveOnBlur = false,
    saveOnEnter = true,
    cancelOnEscape = true,

    // 스타일링
    className = '',
    displayClassName = '',
    buttonsClassName = '',

    // TextField props
    textFieldProps = {},

    // 커스텀 렌더링
    renderDisplay,
    renderEditButton,
    renderActionButtons,
}) => {
    // === 상태 관리 ===
    const [internalIsEditing, setInternalIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(value)
    const [isSaving, setIsSaving] = useState(false)
    const [isValid, setIsValid] = useState(true)

    const inputRef = useRef<HTMLInputElement>(null)

    // 제어형/비제어형 편집 상태 처리
    const isControlledEditing = externalIsEditing !== undefined
    const isEditing = isControlledEditing ? externalIsEditing : internalIsEditing

    const isEmpty = !value || value.trim() === ''
    const hasChanges = editValue !== value

    // === 편집 상태 변경 ===
    const setEditingState = useCallback(
        (editing: boolean) => {
            if (isControlledEditing) {
                onEditingChange?.(editing)
            } else {
                setInternalIsEditing(editing)
            }
        },
        [isControlledEditing, onEditingChange]
    )

    // === 편집 시작 ===
    const handleStartEdit = useCallback(() => {
        if (!editable) return
        setEditValue(value)
        setEditingState(true)
    }, [editable, value, setEditingState])

    // === 저장 ===
    const handleSave = useCallback(async () => {
        if (!isValid || !hasChanges) {
            setEditingState(false)
            return
        }

        setIsSaving(true)
        try {
            await onSave(editValue)
            setEditingState(false)
        } catch (error) {
            console.error('저장 실패:', error)
        } finally {
            setIsSaving(false)
        }
    }, [editValue, onSave, setEditingState, isValid, hasChanges])

    // === 취소 ===
    const handleCancel = useCallback(() => {
        setEditValue(value)
        setEditingState(false)
    }, [value, setEditingState])

    // === TextField 이벤트 핸들러 ===
    const handleTextFieldChange = useCallback((newValue: string) => {
        setEditValue(newValue)
    }, [])

    const handleValidationChange = useCallback((result: { isValid: boolean; message?: string }) => {
        setIsValid(result.isValid)
    }, [])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (saveOnEnter && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSave()
            }
            if (cancelOnEscape && e.key === 'Escape') {
                e.preventDefault()
                handleCancel()
            }
            textFieldProps.onKeyDown?.(e)
        },
        [saveOnEnter, cancelOnEscape, handleSave, handleCancel, textFieldProps]
    )

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            if (saveOnBlur) {
                handleSave()
            }
            textFieldProps.onBlur?.(e)
        },
        [saveOnBlur, handleSave, textFieldProps]
    )

    // value 변경 시 editValue 동기화
    useEffect(() => {
        if (!isEditing) {
            setEditValue(value)
        }
    }, [value, isEditing])

    return (
        <div className={`editable-text ${className}`}>
            {/* 라벨 */}
            {label && <label className='block mb-1 text-sm font-medium text-gray-700'>{label}</label>}

            <div className='flex items-center gap-2'>
                {isEditing ? (
                    /* 편집 모드 */
                    <>
                        <div className='flex-1'>
                            <TextField
                                {...textFieldProps}
                                value={editValue}
                                onChange={handleTextFieldChange}
                                onValidationChange={handleValidationChange}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                                autoFocus
                                disabled={isSaving}
                                className={`w-full ${textFieldProps.className || ''}`}
                            />
                        </div>

                        {/* 액션 버튼들 */}
                        <div className={`flex items-center gap-1 ${buttonsClassName}`}>
                            {renderActionButtons ? (
                                renderActionButtons(handleSave, handleCancel, isSaving)
                            ) : (
                                <>
                                    {/* 저장 버튼 */}
                                    <button
                                        onClick={handleSave}
                                        disabled={!isValid || !hasChanges || isSaving}
                                        className='p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                        title='저장'
                                    >
                                        {isSaving ? (
                                            <Loader2 className='w-4 h-4 animate-spin' />
                                        ) : (
                                            <Check className='w-4 h-4' />
                                        )}
                                    </button>

                                    {/* 취소 버튼 */}
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className='p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                        title='취소'
                                    >
                                        <X className='w-4 h-4' />
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    /* 표시 모드 */
                    <>
                        <div className={`flex-1 ${displayClassName}`}>
                            {renderDisplay ? (
                                renderDisplay(value, isEmpty)
                            ) : (
                                <div className={`py-2 px-3 ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                                    {isEmpty ? emptyText : value}
                                </div>
                            )}
                        </div>

                        {/* 편집 버튼 */}
                        {editable && (
                            <div className={buttonsClassName}>
                                {renderEditButton ? (
                                    renderEditButton(handleStartEdit)
                                ) : (
                                    <button
                                        onClick={handleStartEdit}
                                        className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors'
                                        title='편집'
                                    >
                                        <Edit2 className='w-4 h-4' />
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default EditableText
