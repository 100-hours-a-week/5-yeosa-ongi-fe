import { useState } from 'react'
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
]

// 태그 컨테이너 컴포넌트
const TagContainer = () => {
    // 활성화된 태그들과 순서 관리
    const [activeTags, setActiveTags] = useState<string[]>([])

    // 태그 클릭 핸들러
    const handleTagClick = (tagLabel: string): void => {
        setActiveTags(prev => {
            if (prev.includes(tagLabel)) {
                // 이미 활성화된 태그면 비활성화
                return prev.filter(tag => tag !== tagLabel)
            } else {
                // 비활성화된 태그면 활성화 (맨 뒤에 추가)
                return [...prev, tagLabel]
            }
        })
    }

    return (
        <div className='w-full p-6 pt-2 mx-auto space-y-8'>
            {/* 카테고리별 태그들 */}

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

            {/* 선택된 태그 데이터 (개발용)
            <div className='p-4 border border-gray-200 rounded-lg bg-gray-50'>
                <pre className='p-3 overflow-x-auto text-xs text-gray-600 bg-white border rounded'>
                    {JSON.stringify(activeTags, null, 2)}
                </pre>
            </div> */}
        </div>
    )
}

export default TagContainer
