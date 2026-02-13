export declare enum Gender {
    MALE = "male",
    FEMALE = "female"
}
export declare class CreateUserDto {
    name: string;
    photo?: string;
    bio?: string;
    city: string;
    gender?: Gender;
    instagram?: string;
    telegram?: string;
}
