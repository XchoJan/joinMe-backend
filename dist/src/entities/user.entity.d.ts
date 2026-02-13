export declare class User {
    id: string;
    name: string;
    photo?: string;
    bio?: string;
    city: string;
    gender?: 'male' | 'female';
    instagram?: string;
    telegram?: string;
    fcmToken?: string;
    premium: boolean;
    username?: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
}
