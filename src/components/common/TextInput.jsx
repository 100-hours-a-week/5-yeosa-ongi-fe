import { useState } from "react";

const TextInput = ({
	value,
	defaultValue = "",
	placeholder = "",
	maxLength,

	size = "small", // 'small' | 'medium' | 'large'
	variant = "borderless",
	fullWidth = false,
	className = "",

	label,
	helperText,

	showCharacterCount = false,
	validation = {},
	onChange,
	onBlur,
	onFocus,
	...rest
}) => {
	const [internalValue, setInternalValue] = useState(defaultValue);
	const [isFocused, setIsFocused] = useState(false);
	const [validationState, setValidationState] = useState({
		isValid: true,
		errorMessage: null,
		hasBeenValidated: false,
	});

	const isControlled = value !== undefined;
	const inputValue = isControlled ? value : internalValue;
	const characterCount = inputValue.length;

	const handleChange = (event) => {
		const newValue = event.target.value;
		if (maxLength && newValue.length > maxLength) {
			return;
		}

		// 상태 업데이트
		if (!isControlled) {
			setInternalValue(newValue);
		}

		// 검증 실행 (검증된 적이 있다면)
		if (validationState.hasBeenValidated) {
			const validation = validateInput(newValue);
			setValidationState({
				...validation,
				hasBeenValidated: true,
			});
		}

		// 부모 onChange 호출
		if (onChange) {
			onChange(newValue, event);
		}
	};

	// 포커스 핸들러
	const handleFocus = (event) => {
		setIsFocused(true);
		if (onFocus) {
			onFocus(event);
		}
	};

	// 블러 핸들러
	const handleBlur = (event) => {
		setIsFocused(false);

		// 블러 시 검증 실행
		const validation = validateInput(inputValue);
		setValidationState({
			...validation,
			hasBeenValidated: true,
		});

		if (onBlur) {
			onBlur(event);
		}
	};

	const getInputClasses = () => {
		const baseClass = "text-input";
		const classes = [baseClass];

		if (size) classes.push(`${baseClass}--${size}`);
		if (variant) classes.push(`${baseClass}--${variant}`);
		if (fullWidth) classes.push(`${baseClass}--full-width`);
		if (isFocused) classes.push(`${baseClass}--focused`);
		if (!validationState.isValid) classes.push(`${baseClass}--error`);
		if (className) classes.push(className);

		return classes.join(" ");
	};

	return (
		<div className="text-input-wrapper">
			{/* 라벨 */}
			{label && (
				<label className="text-input-label">
					{label}
					{validation.required && (
						<span className="required-mark">*</span>
					)}
				</label>
			)}

			{/* 입력 필드 */}
			<div className="text-input-container">
				<input
					type="text"
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
					<div className="character-count">
						{characterCount}
						{maxLength && `/${maxLength}`}
					</div>
				)}
			</div>

			{/* 도움말 텍스트 또는 에러 메시지 */}
			{(helperText || !validationState.isValid) && (
				<div
					className={`text-input-helper ${
						!validationState.isValid ? "error" : ""
					}`}>
					{!validationState.isValid
						? validationState.errorMessage
						: helperText}
				</div>
			)}
		</div>
	);
};

export default TextInput;
