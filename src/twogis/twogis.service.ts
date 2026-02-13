import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SearchVenuesDto } from './dto/search-venues.dto';

const BASE_URL = 'https://catalog.api.2gis.com/3.0';

@Injectable()
export class TwogisService {
  private apiKey: string;

  constructor(private configService: ConfigService) {
    // Получаем API ключ из переменных окружения или используем демо ключ
    this.apiKey = this.configService.get<string>('TWOGIS_API_KEY', 'cbbac416-23da-4f9e-8622-caa8211b9c2c');
  }

  /**
   * Получить координаты города по названию
   */
  private getCityCoordinates(cityName: string): { lat: number; lon: number } | null {
    // Координаты городов Армении
    const cityCoords: Record<string, { lat: number; lon: number }> = {
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

  /**
   * Поиск заведений через API 2ГИС
   */
  async searchVenues(params: SearchVenuesDto) {
    try {
      const searchParams: any = {
        key: this.apiKey,
        fields: 'items.id,items.name,items.address_name,items.point,items.rubrics,items.photos',
        page: params.page || 1,
        // API 2ГИС ограничивает page_size от 1 до 10
        page_size: Math.min(params.page_size || 10, 10),
      };

      // Формируем поисковый запрос (q)
      if (params.rubric_id && params.rubric_id !== '') {
        // Если указана рубрика, используем название рубрики для поиска
        const rubricNames: Record<string, string> = {
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
      } else if (params.q) {
        searchParams.q = params.q;
      } else {
        searchParams.q = '*';
      }

      // Добавляем location (координаты) если указан город
      if (params.city && params.city !== '' && params.city !== 'Все города') {
        const coords = this.getCityCoordinates(params.city);
        if (coords) {
          // Формат location: "lon,lat" согласно документации
          searchParams.location = `${coords.lon},${coords.lat}`;
        }
      }

      // Используем правильный endpoint согласно документации
      const endpoint = `${BASE_URL}/items`;

      const response = await axios.get(endpoint, {
        params: searchParams,
      });

      // Проверяем ответ
      if (response.data?.meta?.error) {
        throw new HttpException(
          {
            message: '2GIS API error',
            error: response.data.meta.error,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (response.data?.result) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Failed to search venues',
          error: error.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Получить список городов для поиска
   */
  async getCities() {
    try {
      const response = await axios.get(`${BASE_URL}/cities`, {
        params: {
          key: this.apiKey,
          fields: 'items.id,items.name',
        },
      });

      return response.data?.result?.items || [];
    } catch (error: any) {
      throw new HttpException(
        {
          message: 'Failed to fetch cities',
          error: error.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Получить список рубрик (категорий заведений)
   */
  async getRubrics() {
    try {
      const response = await axios.get(`${BASE_URL}/rubrics`, {
        params: {
          key: this.apiKey,
          fields: 'items.id,items.name',
        },
      });

      return response.data?.result?.items || [];
    } catch (error: any) {
      throw new HttpException(
        {
          message: 'Failed to fetch rubrics',
          error: error.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Получить детальную информацию о заведении
   */
  async getVenueDetails(venueId: string, city?: string) {
    try {
      const params: any = {
        key: this.apiKey,
        fields: 'id,name,address_name,point,rubrics,photos',
      };

      if (city) {
        params.city = city;
      }

      const response = await axios.get(`${BASE_URL}/items/${venueId}`, {
        params,
      });

      const item = response.data?.result;
      if (!item) {
        throw new HttpException(
          {
            message: 'Venue not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return item;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Failed to fetch venue details',
          error: error.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

