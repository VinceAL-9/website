import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  studentId: string | null;
  createdAt: Date;
}
