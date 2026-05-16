export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tokenType?: 'access' | 'refresh';
}
