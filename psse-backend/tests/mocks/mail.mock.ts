export const mailMock = {
  sendMail: jest.fn().mockResolvedValue({
    messageId: '<test-message-id@mock.mail>',
  }),
  sendUserConfirmation: jest.fn().mockResolvedValue(true),
};
