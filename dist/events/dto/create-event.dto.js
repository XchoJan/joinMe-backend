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
exports.CreateEventDto = exports.PaymentType = exports.EventFormat = void 0;
const class_validator_1 = require("class-validator");
var EventFormat;
(function (EventFormat) {
    EventFormat["COFFEE"] = "coffee";
    EventFormat["WALK"] = "walk";
    EventFormat["LUNCH"] = "lunch";
    EventFormat["DINNER"] = "dinner";
    EventFormat["ACTIVITY"] = "activity";
    EventFormat["OTHER"] = "other";
})(EventFormat || (exports.EventFormat = EventFormat = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["DUTCH"] = "dutch";
    PaymentType["MY_TREAT"] = "my_treat";
    PaymentType["YOUR_TREAT"] = "your_treat";
    PaymentType["FREE"] = "free";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
class CreateEventDto {
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
    authorGender;
}
exports.CreateEventDto = CreateEventDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "time", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(EventFormat),
    __metadata("design:type", String)
], CreateEventDto.prototype, "format", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PaymentType),
    __metadata("design:type", String)
], CreateEventDto.prototype, "paymentType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateEventDto.prototype, "participantLimit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEventDto.prototype, "currentParticipants", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "authorId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['male', 'female']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "authorGender", void 0);
//# sourceMappingURL=create-event.dto.js.map