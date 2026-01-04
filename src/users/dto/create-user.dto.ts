import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  telegram?: string;
}

