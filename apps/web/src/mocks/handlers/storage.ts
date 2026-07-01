import { http, HttpResponse } from 'msw';

export const storageHandlers = [
  // POST /api/v1/storage/student-avatar/upload-url
  http.post('*/api/v1/storage/student-avatar/upload-url', async () => {
    return HttpResponse.json({
      data: {
        url: 'https://minio.example.com/avatars',
        fields: {
          key: 'avatars/abc123.jpg',
          'Content-Type': 'image/jpeg',
        },
        objectKey: 'avatars/abc123.jpg',
      },
    });
  }),
];
