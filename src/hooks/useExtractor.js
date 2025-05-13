

const extractLocation = async (file) => {
    try {
        // GPS 정보만 추출
        const gps = await exifr.gps(file); // { latitude, longitude } 또는 null

        if (gps && gps.latitude && gps.longitude) {
            console.log('GPS 정보:', gps);
            return {
                latitude: gps.latitude,
                longitude: gps.longitude
            };
        } else {
            console.log('GPS 정보 없음');
            return null;
        }
    } catch (error) {
        console.error(`메타데이터 추출 오류: ${error.message}`);
        return null;
    }
};

export default extractLocation;
