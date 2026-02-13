import { ConfigService } from '@nestjs/config';
import { SearchVenuesDto } from './dto/search-venues.dto';
export declare class TwogisService {
    private configService;
    private apiKey;
    constructor(configService: ConfigService);
    private getCityCoordinates;
    searchVenues(params: SearchVenuesDto): Promise<any>;
    getCities(): Promise<any>;
    getRubrics(): Promise<any>;
    getVenueDetails(venueId: string, city?: string): Promise<any>;
}
