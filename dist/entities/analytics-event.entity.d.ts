export declare enum AnalyticsEventType {
    USER_CREATED = "user_created",
    EVENT_CREATED = "event_created",
    EVENT_REQUEST_CREATED = "event_request_created"
}
export declare class AnalyticsEvent {
    id: string;
    type: AnalyticsEventType;
    userId?: string;
    eventId?: string;
    metadata?: string | null;
    createdAt: Date;
}
