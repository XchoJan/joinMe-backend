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
exports.EventRequest = void 0;
const typeorm_1 = require("typeorm");
const event_entity_1 = require("./event.entity");
const user_entity_1 = require("./user.entity");
let EventRequest = class EventRequest {
    id;
    eventId;
    event;
    userId;
    user;
    status;
    createdAt;
};
exports.EventRequest = EventRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EventRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EventRequest.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event),
    (0, typeorm_1.JoinColumn)({ name: 'eventId' }),
    __metadata("design:type", event_entity_1.Event)
], EventRequest.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EventRequest.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], EventRequest.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], EventRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EventRequest.prototype, "createdAt", void 0);
exports.EventRequest = EventRequest = __decorate([
    (0, typeorm_1.Entity)('event_requests')
], EventRequest);
//# sourceMappingURL=event-request.entity.js.map