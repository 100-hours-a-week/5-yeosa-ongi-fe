// pages/api/auth/kakao/callback.ts
import axios from 'axios'

export default async function handler(req, res) {
    const { code } = req.query

    try {
        const tokenRes = await axios.post(
            'https://kauth.kakao.com/oauth/token',
            null,
            {
                params: {
                    grant_type: 'authorization_code',
                    client_id: process.env.KAKAO_REST_API_KEY,
                    redirect_uri: 'http://localhost:3000/api/auth/kakao/callback',
                    code,
                    client_secret: process.env.KAKAO_CLIENT_SECRET,
                },
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                },
            }
        )

        const { access_token } = tokenRes.data

        const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })

        const user = userRes.data

        // TODO: 세션 저장 or DB 연동
        console.log('카카오 유저:', user)

        // 예시: 로그인 완료 후 메인 페이지로 리디렉션
        res.redirect(`/`)
    } catch (err) {
        console.error('카카오 로그인 실패:', err)
        res.status(500).json({ error: 'Login Failed' })
    }
}


