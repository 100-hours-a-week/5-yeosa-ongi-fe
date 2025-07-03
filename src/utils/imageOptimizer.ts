export const generateOptimizedUrl = (s3Url: string, width: number, height: number) => {
    if (!s3Url || s3Url === '/default-thumbnail.jpg') {
        return s3Url
    }

    // S3 URL을 CloudFront URL로 변경
    const cloudFrontUrl = s3Url.replace(
        /https:\/\/[^.]+\.s3\.amazonaws\.com/,
        'https://your-cloudfront-domain.cloudfront.net'
    )

    // 디바이스 픽셀 비율 고려 (최대 2배)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const actualWidth = Math.round(width * dpr)
    const actualHeight = Math.round(height * dpr)

    return `${cloudFrontUrl}?w=${actualWidth}&h=${actualHeight}&q=80&f=webp`
}
