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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
    ping(request) {
        console.log('Ping request from:', {
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            origin: request.headers['origin'],
            referer: request.headers['referer'],
            headers: request.headers,
        });
        return {
            status: 'ok',
            message: 'pong',
            timestamp: new Date().toISOString(),
            clientInfo: {
                ip: request.ip,
                userAgent: request.headers['user-agent'],
            },
        };
    }
    test(request) {
        console.log('=== TEST REQUEST ===');
        console.log('Method:', request.method);
        console.log('IP:', request.ip);
        console.log('User-Agent:', request.headers['user-agent']);
        console.log('Origin:', request.headers['origin']);
        console.log('Referer:', request.headers['referer']);
        console.log('All headers:', JSON.stringify(request.headers, null, 2));
        console.log('===================');
        return {
            success: true,
            method: request.method,
            timestamp: new Date().toISOString(),
            headers: request.headers,
            ip: request.ip,
        };
    }
    socketTest() {
        return {
            message: 'Socket.io test endpoint',
            socketPath: '/socket.io/',
            instructions: 'Try connecting to: https://musicialconnect.com/socket.io/',
            note: 'Socket.io should be available at /socket.io/ path (not /api/socket.io/)',
            testUrl: 'https://musicialconnect.com/socket.io/?EIO=4&transport=polling',
            explanation: 'Socket.io requires query parameters: EIO=4&transport=polling or transport=websocket',
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('ping'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "ping", null);
__decorate([
    (0, common_1.All)('test'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "test", null);
__decorate([
    (0, common_1.Get)('socket-test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "socketTest", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map