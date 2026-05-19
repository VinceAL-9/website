export const cloudinaryMock = {
  uploadImage: jest.fn().mockResolvedValue({
    secure_url:
      'https://res.cloudinary.com/demo/image/upload/v1554807498/sample.jpg',
    public_id: 'sample',
  }),
  deleteImage: jest.fn().mockResolvedValue({
    result: 'ok',
  }),
};
