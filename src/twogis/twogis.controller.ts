import { Controller, Get, Query, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { TwogisService } from './twogis.service';
import { SearchVenuesDto } from './dto/search-venues.dto';

@Controller('twogis')
export class TwogisController {
  constructor(private readonly twogisService: TwogisService) {}

  @Get('venues/search')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }))
  async searchVenues(@Query() query: SearchVenuesDto) {
    return await this.twogisService.searchVenues(query);
  }

  @Get('cities')
  async getCities() {
    return await this.twogisService.getCities();
  }

  @Get('rubrics')
  async getRubrics() {
    return await this.twogisService.getRubrics();
  }

  @Get('venues/:id')
  async getVenueDetails(
    @Param('id') id: string,
    @Query('city') city?: string,
  ) {
    return await this.twogisService.getVenueDetails(id, city);
  }
}

