import TagItem from './TagItem'

const predefinedTags: string[] = [
    'IT',
    '공연',
    '교통수단',
    '동물',
    '식물',
    '액티비티',
    '업무',
    '여행',
    '운동',
    '음식과 음료',
    '인물',
    '장소',
    '취미',
    '풍경',
] as const

export interface TagContainerProps {
    activeTags: string[]
    onTagChange: (tags: string[]) => void
}

const TagContainer = ({ activeTags, onTagChange }: TagContainerProps) => {
    // 태그 클릭 핸들러
    const handleTagClick = (tagLabel: string): void => {
        if (activeTags.includes(tagLabel)) {
            // 이미 활성화된 태그면 비활성화
            onTagChange(activeTags.filter(tag => tag !== tagLabel))
        } else {
            onTagChange([...activeTags, tagLabel])
        }
    }

    return (
        <div className='w-full p-6 pt-2 mx-auto space-y-8'>
            <div className='flex flex-wrap gap-2'>
                {/* 활성화된 태그들을 먼저 표시 (선택 순서대로) */}
                {activeTags
                    .filter(tagLabel => predefinedTags.includes(tagLabel))
                    .map(tagLabel => (
                        <TagItem key={`active-${tagLabel}`} label={tagLabel} isActive={true} onClick={handleTagClick} />
                    ))}
                {/* 비활성화된 태그들을 그 다음에 표시 */}
                {predefinedTags
                    .filter(tagLabel => !activeTags.includes(tagLabel))
                    .map(tagLabel => (
                        <TagItem
                            key={`inactive-${tagLabel}`}
                            label={tagLabel}
                            isActive={false}
                            onClick={handleTagClick}
                        />
                    ))}
            </div>
        </div>
    )
}

export default TagContainer
