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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("./events.service");
const create_event_dto_1 = require("./dto/create-event.dto");
let EventsController = class EventsController {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    async create(eventData) {
        return await this.eventsService.create(eventData);
    }
    async findAll(city) {
        return await this.eventsService.findAll(city);
    }
    async findByAuthor(authorId) {
        return await this.eventsService.findByAuthor(authorId);
    }
    async findByParticipant(userId) {
        return await this.eventsService.findByParticipant(userId);
    }
    async removeParticipant(body) {
        if (!body?.authorId) {
            throw new Error('authorId is required');
        }
        if (!body?.userId) {
            throw new Error('userId is required');
        }
        if (!body?.eventId) {
            throw new Error('eventId is required');
        }
        return await this.eventsService.removeParticipant(body.eventId, body.userId, body.authorId);
    }
    async delete(id, body) {
        if (!body?.authorId) {
            throw new Error('authorId is required');
        }
        try {
            await this.eventsService.delete(id, body.authorId);
            return { success: true };
        }
        catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }
    async getRequests(eventId) {
        return await this.eventsService.getRequests(eventId);
    }
    async createRequest(eventId, body) {
        return await this.eventsService.createRequest(eventId, body.userId);
    }
    async findOne(id) {
        const event = await this.eventsService.findOne(id);
        if (!event) {
            throw new Error('Event not found');
        }
        return event;
    }
    async approveRequest(requestId) {
        return await this.eventsService.approveRequest(requestId);
    }
    async rejectRequest(requestId) {
        return await this.eventsService.rejectRequest(requestId);
    }
    async leaveEvent(eventId, body) {
        if (!body?.userId) {
            throw new Error('userId is required');
        }
        return await this.eventsService.leaveEvent(eventId, body.userId);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my/:authorId'),
    __param(0, (0, common_1.Param)('authorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findByAuthor", null);
__decorate([
    (0, common_1.Get)('participant/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findByParticipant", null);
__decorate([
    (0, common_1.Post)('participants/remove'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "removeParticipant", null);
__decorate([
    (0, common_1.Put)(':id/delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/requests'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getRequests", null);
__decorate([
    (0, common_1.Post)(':id/requests'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Put)('requests/:requestId/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "leaveEvent", null);
exports.EventsController = EventsController = __decorate([
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map