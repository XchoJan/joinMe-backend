export declare enum EventFormat {
    COFFEE = "coffee",
    WALK = "walk",
    LUNCH = "lunch",
    DINNER = "dinner",
    ACTIVITY = "activity",
    OTHER = "other"
}
export declare enum PaymentType {
    DUTCH = "dutch",
    MY_TREAT = "my_treat",
    YOUR_TREAT = "your_treat",
    FREE = "free"
}
export declare class CreateEventDto {
    title: string;
    description: string;
    city: string;
    location: string;
    date: string;
    time: string;
    format: EventFormat;
    paymentType: PaymentType;
    participantLimit: number;
    currentParticipants?: number;
    authorId: string;
    authorGender?: 'male' | 'female';
}
