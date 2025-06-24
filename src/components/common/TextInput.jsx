import { useEffect, useState } from 'react'

const TextInput = ({
    value,
    defaultValue = '',
    placeholder = '',
    maxLength,

    size = 'small', // 'small' | 'medium' | 'large'
    variant = 'borderless',
    fullWidth = false,
    className = '',
    reserveHelperSpace = true,

    label,
    helperText,

    showCharacterCount = false,
    validation = {},
    validationFunction,
    onChange,
    onBlur,
    onFocus,
    onValidationChange,
    ...rest
}) => {
    const [internalValue, setInternalValue] = useState(defaultValue)
    const [isFocused, setIsFocused] = useState(false)
    const [validationState, setValidationState] = useState({
        isValid: false,
        errorMessage: null,
        hasBeenValidated: false,
    })

    const isControlled = value !== undefined
    const inputValue = isControlled ? value : internalValue
    const characterCount = inputValue.length
    const [debouncedValidation, setDebouncedValidation] = useState(null)

    useEffect(() => {
        // 값이 없거나 아직 검증된 적이 없으면 스킵
        if (!inputValue || !validationState.hasBeenValidated) {
            return
        }

        const timer = setTimeout(() => {
            const validation = validateInput(inputValue)
            setValidationState({
                ...validation,
                hasBeenValidated: true,
            })
        }, 300) // 300ms 딜레이

        // 클린업: 새로운 입력이 들어오면 이전 타이머 취소
        return () => clearTimeout(timer)
    }, [inputValue, validationState.hasBeenValidated])

    useEffect(() => {
        if (onValidationChange) {
            onValidationChange({
                isValid: validationState.isValid,
                value: inputValue,
                errorMessage: validationState.errorMessage,
                hasBeenValidated: validationState.hasBeenValidated,
            })
        }
    }, [
        validationState.isValid,
        inputValue,
        validationState.errorMessage,
        validationState.hasBeenValidated,
        onValidationChange,
    ])

    const validateWithFunction = inputValue => {
        if (!validationFunction) {
            return {
                isValid: true,
                errorMessage: null,
                helperText: helperText || '',
            }
        }

        const result = validationFunction(inputValue)
        console.log(result)
        // 결과가 객체 형태인 경우
        if (result && typeof result === 'object') {
            return {
                isValid: result.isValid,
                errorMessage: result.isValid ? null : result.message,
                helperText: result.message || '',
            }
        }

        // 결과가 문자열인 경우 (에러 메시지)
        if (typeof result === 'string') {
            return {
                isValid: false,
                errorMessage: result,
                helperText: result,
            }
        }

        // 결과가 없거나 null/undefined인 경우 (유효함)
        return {
            isValid: true,
            errorMessage: null,
            helperText: helperText || '',
        }
    }

    const validateInput = inputValue => {
        if (validationFunction) {
            return validateWithFunction(inputValue)
        }
        return '!!'
    }

    const handleChange = event => {
        const newValue = event.target.value
        if (maxLength && newValue.length > maxLength) {
            return
        }

        // 상태 업데이트
        if (!isControlled) {
            setInternalValue(newValue)
        }

        // 부모 onChange 호출
        if (onChange) {
            console.log(validationState)
            onChange(newValue, event, validationState.isValid)
        }
    }

    // 포커스 핸들러
    const handleFocus = event => {
        setIsFocused(true)
        if (onFocus) {
            onFocus(event)
        }
    }

    // 블러 핸들러
    const handleBlur = event => {
        setIsFocused(false)

        // 블러 시 검증 실행
        const validation = validateInput(inputValue)
        setValidationState({
            ...validation,
            hasBeenValidated: true,
        })

        if (onBlur) {
            onBlur(event)
        }
    }

    const getInputClasses = () => {
        const baseClass = 'text-input'
        const classes = [baseClass]

        if (size) classes.push(`${baseClass}--${size}`)
        if (variant) classes.push(`${baseClass}--${variant}`)
        if (fullWidth) classes.push(`${baseClass}--full-width`)
        if (isFocused) classes.push(`${baseClass}--focused`)
        if (!validationState.isValid) classes.push(`${baseClass}--error`)
        if (className) classes.push(className)

        return classes.join(' ')
    }

    return (
        <div className='text-input-wrapper'>
            {/* 라벨 */}
            {label && (
                <label className='text-input-label'>
                    {label}
                    {validation.required && (
                        <span className='required-mark'>*</span>
                    )}
                </label>
            )}

            {/* 입력 필드 */}
            <div className='text-input-container'>
                <input
                    type='text'
                    value={inputValue}
                    placeholder={placeholder}
                    className={getInputClasses()}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...rest}
                />

                {/* 글자 수 표시 */}
                {showCharacterCount && (
                    <div className='character-count'>
                        {characterCount}
                        {maxLength && `/${maxLength}`}
                    </div>
                )}
            </div>

            {/* 도움말 텍스트 또는 에러 메시지 */}
            <div className={reserveHelperSpace ? 'h-7' : ''}>
                {(helperText || !validationState.isValid) && (
                    <div
                        className={`text-xs pt-1 ${
                            !validationState.isValid ? 'text-red-400' : ''
                        }`}
                    >
                        {!validationState.isValid
                            ? validationState.errorMessage
                            : helperText || ' '}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TextInput
