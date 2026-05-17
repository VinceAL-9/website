import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Matches(/^[a-zA-Z0-9._%+-]+@cpu\.edu\.ph$/, {
    message: 'Registration is restricted to official university emails',
  })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Student ID is required' })
  studentId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;
}
