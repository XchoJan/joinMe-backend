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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwogisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'https://catalog.api.2gis.com/3.0';
let TwogisService = class TwogisService {
    configService;
    apiKey;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('TWOGIS_API_KEY', 'cbbac416-23da-4f9e-8622-caa8211b9c2c');
    }
    getCityCoordinates(cityName) {
        const cityCoords = {
            'Ереван': { lat: 40.1811, lon: 44.5133 },
            'Гюмри': { lat: 40.7894, lon: 43.8475 },
            'Ванадзор': { lat: 40.8128, lon: 44.4883 },
            'Абовян': { lat: 40.2736, lon: 44.6256 },
            'Капан': { lat: 39.2075, lon: 46.4058 },
            'Армавир': { lat: 40.1544, lon: 44.0381 },
            'Гавар': { lat: 40.3589, lon: 45.1267 },
            'Иджеван': { lat: 40.8756, lon: 45.1492 },
            'Аштарак': { lat: 40.2981, lon: 44.3619 },
            'Севан': { lat: 40.5511, lon: 44.9528 },
            'Дилижан': { lat: 40.7411, lon: 44.8631 },
            'Степанаван': { lat: 41.0092, lon: 44.3847 },
            'Артик': { lat: 40.6167, lon: 43.9667 },
            'Алаверди': { lat: 41.0975, lon: 44.6519 },
            'Масис': { lat: 40.0681, lon: 44.4361 },
            'Веди': { lat: 40.1375, lon: 44.1081 },
            'Ехегнадзор': { lat: 39.7631, lon: 45.3322 },
            'Горис': { lat: 39.5111, lon: 46.3397 },
            'Мегри': { lat: 38.9019, lon: 46.2444 },
            'Спитак': { lat: 40.8361, lon: 44.2672 },
        };
        return cityCoords[cityName] || null;
    }
    async searchVenues(params) {
        try {
            const searchParams = {
                key: this.apiKey,
                fields: 'items.id,items.name,items.address_name,items.point,items.rubrics,items.photos',
                page: params.page || 1,
                page_size: Math.min(params.page_size || 10, 10),
            };
            if (params.rubric_id && params.rubric_id !== '') {
                const rubricNames = {
                    '184106343': 'кафе',
                    '184106394': 'ресторан',
                    '184106392': 'бар',
                    '184106390': 'пиццерия',
                    '184106395': 'суши',
                    '184106391': 'бургер',
                    '184106344': 'кофейня',
                    '184106393': 'паб',
                };
                searchParams.q = rubricNames[params.rubric_id] || params.q || '*';
            }
            else if (params.q) {
                searchParams.q = params.q;
            }
            else {
                searchParams.q = '*';
            }
            if (params.city && params.city !== '' && params.city !== 'Все города') {
                const coords = this.getCityCoordinates(params.city);
                if (coords) {
                    searchParams.location = `${coords.lon},${coords.lat}`;
                }
            }
            const endpoint = `${BASE_URL}/items`;
            const response = await axios_1.default.get(endpoint, {
                params: searchParams,
            });
            if (response.data?.meta?.error) {
                throw new common_1.HttpException({
                    message: '2GIS API error',
                    error: response.data.meta.error,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (response.data?.result) {
                return response.data;
            }
            return null;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                message: 'Failed to search venues',
                error: error.message || 'Unknown error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCities() {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/cities`, {
                params: {
                    key: this.apiKey,
                    fields: 'items.id,items.name',
                },
            });
            return response.data?.result?.items || [];
        }
        catch (error) {
            throw new common_1.HttpException({
                message: 'Failed to fetch cities',
                error: error.message || 'Unknown error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRubrics() {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/rubrics`, {
                params: {
                    key: this.apiKey,
                    fields: 'items.id,items.name',
                },
            });
            return response.data?.result?.items || [];
        }
        catch (error) {
            throw new common_1.HttpException({
                message: 'Failed to fetch rubrics',
                error: error.message || 'Unknown error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getVenueDetails(venueId, city) {
        try {
            const params = {
                key: this.apiKey,
                fields: 'id,name,address_name,point,rubrics,photos',
            };
            if (city) {
                params.city = city;
            }
            const response = await axios_1.default.get(`${BASE_URL}/items/${venueId}`, {
                params,
            });
            const item = response.data?.result;
            if (!item) {
                throw new common_1.HttpException({
                    message: 'Venue not found',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return item;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                message: 'Failed to fetch venue details',
                error: error.message || 'Unknown error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.TwogisService = TwogisService;
exports.TwogisService = TwogisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TwogisService);
//# sourceMappingURL=twogis.service.js.map