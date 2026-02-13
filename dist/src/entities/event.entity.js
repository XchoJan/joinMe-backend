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
exports.Event = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const event_request_entity_1 = require("./event-request.entity");
const chat_entity_1 = require("./chat.entity");
let Event = class Event {
    id;
    title;
    description;
    city;
    location;
    date;
    time;
    format;
    paymentType;
    participantLimit;
    currentParticipants;
    authorId;
    author;
    authorGender;
    status;
    participants;
    createdAt;
    requests;
    chats;
};
exports.Event = Event;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Event.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Event.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Event.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Event.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Event.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Event.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        enum: ['coffee', 'walk', 'lunch', 'dinner', 'activity', 'other'],
    }),
    __metadata("design:type", String)
], Event.prototype, "format", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        enum: ['dutch', 'my_treat', 'your_treat', 'free'],
    }),
    __metadata("design:type", String)
], Event.prototype, "paymentType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Event.prototype, "participantLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Event.prototype, "currentParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Event.prototype, "authorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'authorId' }),
    __metadata("design:type", user_entity_1.User)
], Event.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        enum: ['male', 'female'],
        nullable: true,
    }),
    __metadata("design:type", String)
], Event.prototype, "authorGender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        enum: ['active', 'completed', 'cancelled'],
        default: 'active',
    }),
    __metadata("design:type", String)
], Event.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { default: '' }),
    __metadata("design:type", Array)
], Event.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Event.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_request_entity_1.EventRequest, (request) => request.event),
    __metadata("design:type", Array)
], Event.prototype, "requests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_entity_1.Chat, (chat) => chat.event),
    __metadata("design:type", Array)
], Event.prototype, "chats", void 0);
exports.Event = Event = __decorate([
    (0, typeorm_1.Entity)('events')
], Event);
//# sourceMappingURL=event.entity.js.map