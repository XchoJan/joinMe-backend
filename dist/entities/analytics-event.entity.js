"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEvent = exports.AnalyticsEventType = void 0;
const typeorm_1 = require("typeorm");
var AnalyticsEventType;
(function (AnalyticsEventType) {
    AnalyticsEventType["USER_CREATED"] = "user_created";
    AnalyticsEventType["EVENT_CREATED"] = "event_created";
    AnalyticsEventType["EVENT_REQUEST_CREATED"] = "event_request_created";
})(AnalyticsEventType || (exports.AnalyticsEventType = AnalyticsEventType = {}));
let AnalyticsEvent = class AnalyticsEvent {
    id;
    type;
    userId;
    eventId;
    metadata;
    createdAt;
};
exports.AnalyticsEvent = AnalyticsEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        enum: AnalyticsEventType,
    }),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, default: null }),
    __metadata("design:type", Object)
], AnalyticsEvent.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AnalyticsEvent.prototype, "createdAt", void 0);
exports.AnalyticsEvent = AnalyticsEvent = __decorate([
    (0, typeorm_1.Entity)('analytics_events')
], AnalyticsEvent);
//# sourceMappingURL=analytics-event.entity.js.map