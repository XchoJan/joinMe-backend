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
exports.TwogisController = void 0;
const common_1 = require("@nestjs/common");
const twogis_service_1 = require("./twogis.service");
const search_venues_dto_1 = require("./dto/search-venues.dto");
let TwogisController = class TwogisController {
    twogisService;
    constructor(twogisService) {
        this.twogisService = twogisService;
    }
    async searchVenues(query) {
        return await this.twogisService.searchVenues(query);
    }
    async getCities() {
        return await this.twogisService.getCities();
    }
    async getRubrics() {
        return await this.twogisService.getRubrics();
    }
    async getVenueDetails(id, city) {
        return await this.twogisService.getVenueDetails(id, city);
    }
};
exports.TwogisController = TwogisController;
__decorate([
    (0, common_1.Get)('venues/search'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_venues_dto_1.SearchVenuesDto]),
    __metadata("design:returntype", Promise)
], TwogisController.prototype, "searchVenues", null);
__decorate([
    (0, common_1.Get)('cities'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TwogisController.prototype, "getCities", null);
__decorate([
    (0, common_1.Get)('rubrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TwogisController.prototype, "getRubrics", null);
__decorate([
    (0, common_1.Get)('venues/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TwogisController.prototype, "getVenueDetails", null);
exports.TwogisController = TwogisController = __decorate([
    (0, common_1.Controller)('twogis'),
    __metadata("design:paramtypes", [twogis_service_1.TwogisService])
], TwogisController);
//# sourceMappingURL=twogis.controller.js.map