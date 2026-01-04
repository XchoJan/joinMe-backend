import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export enum EventFormat {
  COFFEE = 'coffee',
  WALK = 'walk',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  ACTIVITY = 'activity',
  OTHER = 'other',
}

export enum PaymentType {
  DUTCH = 'dutch',
  MY_TREAT = 'my_treat',
  YOUR_TREAT = 'your_treat',
  FREE = 'free',
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsEnum(EventFormat)
  format: EventFormat;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsNumber()
  @Min(1)
  participantLimit: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  currentParticipants?: number; // Сколько человек уже есть (по умолчанию 1)

  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsEnum(['male', 'female'])
  @IsOptional()
  authorGender?: 'male' | 'female';
}

