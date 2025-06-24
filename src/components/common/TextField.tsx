import { useCallback, useRef, useState } from 'react'

type Validator = (value: string) => string | boolean | Promise<string | boolean>

interface ValidationResult {
    isValid: boolean
    message?: string
}

interface TextFieldProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    disabled?: boolean
    error?: string // 외부에서 에러 전달
    label?: string

    defaultValue?: string
    required?: boolean
    maxLength?: number
    className?: string

    validator?: Validator // Promise 지원으로 수정
    onValidationChange?: (result: ValidationResult) => void
    helperText?: string
}

const normalizeValidationResult = (result: string | boolean): ValidationResult => {
    if (typeof result === 'boolean') {
        return { isValid: result }
    }
    if (typeof result === 'string') {
        return { isValid: false, message: result }
    }
    return { isValid: true }
}

// 디바운스 훅 (무한 리렌더링 방지)
const useDebounce = (callback: Function, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const callbackRef = useRef(callback)

    // 항상 최신 callback 참조 유지
    callbackRef.current = callback

    return useCallback(
        (...args: any[]) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay)
        },
        [delay] // callback 의존성 제거
    )
}

const TextField = ({
    value,
    onChange,
    placeholder = '',
    disabled = false,
    error,
    label,

    defaultValue = '',
    required = false,
    maxLength,
    className = '',

    validator,
    onValidationChange,
    helperText,
    ...rest
}: TextFieldProps) => {
    const [internalValue, setInternalValue] = useState(defaultValue)
    const [isFocused, setIsFocused] = useState(false)
    const [validationState, setValidationState] = useState<ValidationResult>({
        isValid: true, // 초기값을 true로 변경
        message: undefined,
    })
    const [isValidating, setIsValidating] = useState(false)

    const isControlled = value !== undefined
    const inputValue = isControlled ? value : internalValue
    const hasError = (!validationState.isValid && validationState.message) || !!error

    /**
     * 검증 실행 함수
     */
    const runValidation = useCallback(
        async (valueToValidate: string) => {
            if (!validator) {
                const result = { isValid: true, message: undefined }
                setValidationState(result)
                onValidationChange?.(result)
                return
            }

            setIsValidating(true)

            try {
                const result = await validator(valueToValidate)
                const normalizedResult = normalizeValidationResult(result)
                setValidationState(normalizedResult)
                onValidationChange?.(normalizedResult)
            } catch (err) {
                const errorResult = { isValid: false, message: 'Validation error' }
                setValidationState(errorResult)
                onValidationChange?.(errorResult)
            } finally {
                setIsValidating(false)
            }
        },
        [validator] // onValidationChange 의존성 제거
    )

    const debouncedValidation = useDebounce(runValidation, 300)

    // 이벤트 핸들러
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value

        if (maxLength && newValue.length > maxLength) {
            return
        }

        if (!isControlled) {
            setInternalValue(newValue)
        }

        onChange?.(newValue)
        debouncedValidation(newValue)
    }

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false)
        runValidation(inputValue)
    }

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true)
    }

    /**
     * tailwind 스타일로 변경하는 함수
     * @returns
     */
    const getInputClasses = () => {
        const baseClasses = [
            'w-full px-3 py-2 border rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            'transition-colors duration-200',
        ]

        if (hasError) {
            baseClasses.push('border-red-500 focus:ring-red-500 focus:border-red-500')
        } else {
            baseClasses.push('border-gray-300 hover:border-gray-400')
        }

        if (className) {
            baseClasses.push(className)
        }

        return baseClasses.join(' ')
    }

    // 표시할 메시지 결정 (error prop 우선)
    const displayMessage = error || validationState.message || helperText

    return (
        <div className='w-full '>
            {/* 라벨 */}
            {label && (
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                    {label}
                    {required && <span className='ml-1 text-red-500'>*</span>}
                </label>
            )}

            {/* 입력 필드 */}
            <div className='relative'>
                <input
                    type='text'
                    value={inputValue}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                    className={getInputClasses()}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...rest}
                />
            </div>

            {/* 도움말 텍스트 또는 에러 메시지
            <div className='min-h-[1.5rem] mt-1'>
                {displayMessage && (
                    <div className={`text-xs ${hasError ? 'text-red-600' : 'text-gray-500'}`}>{displayMessage}</div>
                )}
            </div> */}
        </div>
    )
}

export default TextField
