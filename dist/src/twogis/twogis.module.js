"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwogisModule = void 0;
const common_1 = require("@nestjs/common");
const twogis_controller_1 = require("./twogis.controller");
const twogis_service_1 = require("./twogis.service");
let TwogisModule = class TwogisModule {
};
exports.TwogisModule = TwogisModule;
exports.TwogisModule = TwogisModule = __decorate([
    (0, common_1.Module)({
        controllers: [twogis_controller_1.TwogisController],
        providers: [twogis_service_1.TwogisService],
        exports: [twogis_service_1.TwogisService],
    })
], TwogisModule);
//# sourceMappingURL=twogis.module.js.map