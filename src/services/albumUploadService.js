import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

export class AlbumUploadService {
    static prepareFilesWithNewNames(files) {
        return files.map(fileItem => {
            const newName = uuidv4() + '.' + fileItem.file.type.split('/')[1]
            return {
                ...fileItem,
                newName,
                originalFile: fileItem.file,
            }
        })
    }

    static async uploadFilesToS3(filesWithNewNames, presignedFiles) {
        for (const fileItem of filesWithNewNames) {
            const file = fileItem.originalFile
            const newName = fileItem.newName

            const matched = presignedFiles.find(f => f.pictureName === newName)

            if (!matched) {
                console.error(`${newName}에 대한 매칭되는 presigned URL을 찾을 수 없습니다.`)
                continue
            }

            console.log(`${newName} 파일 업로드 시작...`)

            try {
                await axios.put(matched.presignedUrl, file, {
                    headers: {
                        'Content-Type': file.type,
                    },
                })
                console.log(`${newName} 파일 업로드 완료!`)
            } catch (error) {
                console.error(`${newName} 파일 업로드 중 오류:`, error)
                throw error // 오류를 상위로 전파
            }
        }
    }

    static createAlbumData(albumTitle, files, presignedFiles, tags) {
        const pictureData = presignedFiles.map(f => (
            {
                pictureUrl: f.pictureURL || f.pictureName, // 서버 응답에 따라 적절한 필드 사용
                latitude: files.filter(file => file.newName === f.pictureName)[0].GPS.latitude,
                longitude: files.filter(file => file.newName === f.pictureName)[0].GPS.longitude
            }))

        return {
            albumName: albumTitle,
            pictureUrls: pictureData,
            concepts: tags
        }
    }

    /**
     * 앨범 생성 또는 사진 추가를 위한 통합 메서드
     * 이제 API 훅들을 매개변수로 받아서 사용합니다.
     */
    static async createAlbum(
        albumTitle,
        files,
        albumId,
        tags,
        apiHooks // { getPreSignedUrlMutation, createAlbumMutation, addAlbumPictureMutation }
    ) {
        const { getPreSignedUrlMutation, createAlbumMutation, addAlbumPictureMutation } = apiHooks

        // 1. 앨범 이름과 파일 메타데이터 준비 - 각 파일에 새 이름 할당
        const filesWithNewNames = this.prepareFilesWithNewNames(files)

        const pictures = filesWithNewNames.map(fileItem => ({
            pictureName: fileItem.newName,
            pictureType: fileItem.originalFile.type,
        }))

        console.log('생성된 pictures:', pictures)

        // 2. presigned URL 요청 (훅 사용)
        const presignedResponse = await new Promise((resolve, reject) => {
            getPreSignedUrlMutation.mutate(
                { pictures },
                {
                    onSuccess: (data) => resolve(data),
                    onError: (error) => reject(error)
                }
            )
        })

        const presignedFiles = presignedResponse.presignedFiles

        console.log('서버에서 받은 presignedFiles:', presignedFiles)

        // 3. 각 파일을 presigned URL을 사용하여 업로드
        await this.uploadFilesToS3(filesWithNewNames, presignedFiles)

        // 4. 업로드 완료 후 앨범 생성 또는 사진 추가 요청
        const albumData = this.createAlbumData(albumTitle, filesWithNewNames, presignedFiles, tags)

        console.log('생성할 앨범 데이터:', albumData)

        if (!albumId) {
            // 새 앨범 생성
            const result = await new Promise((resolve, reject) => {
                createAlbumMutation.mutate(
                    albumData,
                    {
                        onSuccess: (data) => {
                            console.log('앨범 생성 결과:', data)
                            resolve(data)
                        },
                        onError: (error) => reject(error)
                    }
                )
            })
            return result
        } else {
            // 기존 앨범에 사진 추가
            const result = await new Promise((resolve, reject) => {
                addAlbumPictureMutation.mutate(
                    { albumId, albumData },
                    {
                        onSuccess: (data) => {
                            console.log('사진 추가 결과:', data)
                            resolve(data)
                        },
                        onError: (error) => reject(error)
                    }
                )
            })
            return result
        }
    }
}
