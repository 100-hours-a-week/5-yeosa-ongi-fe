import defaultProfileImage from "@/assets/default_user_imgae.png";
import iconCheck from "@/assets/icons/icon_check.png";
import icon_pencil from "@/assets/icons/icon_pencil.png";
import { nicknameValidation } from "../../utils/validation";
import TextInput from "../common/TextInput";
import ImageInput from "./ImageInput";

const ProfileSection = ({
	userInfo,
	previewImageURL,
	isUploading,
	isEditing,
	nickname,
	isValid,
	handleProfileImageSelect,
	handleEditClick,
	handleSave,
	handleChange,
	handleKeyDown,
}) => {
	return (
		<div className="flex flex-col items-center">
			<ImageInput
				onFileSelect={handleProfileImageSelect}
				accept="image/*"
				id="profileImageInput">
				<img
					src={
						previewImageURL ||
						userInfo.profileImageURL ||
						defaultProfileImage
					}
					alt={`${userInfo.nickname || "사용자"}의 프로필 이미지`}
					className={`w-24 h-24 rounded-full object-cover ${
						isUploading ? "opacity-50" : ""
					}`}
				/>
				{isUploading && (
					<div className="absolute inset-0 flex items-center justify-center">
						<svg
							className="w-8 h-8 text-white animate-spin"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					</div>
				)}
			</ImageInput>

			<div className="relative flex items-center justify-center mt-4">
				{isEditing ? (
					<div className="flex items-center">
						<TextInput
							value={nickname}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
							className="font-bold text-center border-0 border-b rounded-none text-md border-gray-light w-60 focus:border-b-1 focus:outline-none"
							autoFocus
							maxLength={12}
							showCharacterCount={false}
							validationFunction={nicknameValidation}
							onValidationChange={(state) => {
								/* 필요시 추가 처리 */
							}}
						/>
						<button
							onClick={handleSave}
							disabled={!isValid}
							className={`absolute p-1 px-2 py-1 ml-2 text-sm text-white transform -translate-y-1/2 rounded -right-8 top-1/2 ${
								!isValid ? "opacity-50 cursor-not-allowed" : ""
							}`}>
							<img
								className="w-3 h-3"
								src={iconCheck}
								alt="저장"
							/>
						</button>
					</div>
				) : (
					<>
						<h2 className="font-bold text-center text-md w-60">
							{nickname}
						</h2>
						<button
							className="absolute p-1 transform -translate-y-1/2 -right-8 top-1/2"
							onClick={handleEditClick}
							aria-label="프로필 편집">
							<img
								className="w-4 h-4"
								src={icon_pencil}
								alt="편집"
							/>
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default ProfileSection;
