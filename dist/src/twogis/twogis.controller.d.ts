import { TwogisService } from './twogis.service';
import { SearchVenuesDto } from './dto/search-venues.dto';
export declare class TwogisController {
    private readonly twogisService;
    constructor(twogisService: TwogisService);
    searchVenues(query: SearchVenuesDto): Promise<any>;
    getCities(): Promise<any>;
    getRubrics(): Promise<any>;
    getVenueDetails(id: string, city?: string): Promise<any>;
}
