import { Api, ApiListResponse } from './base/api';
import {IProduct} from "../types";

export interface IAuctionAPI {
    getLotList: () => Promise<IProduct[]>;
}

export class AuctionAPI extends Api implements IAuctionAPI {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    

    getLotList(): Promise<IProduct[]> {
        return this.get('/lot').then((data: ApiListResponse<IProduct>) =>
            data.items.map((item) => ({
                ...item,
                image: this.cdn + item.image
            }))
        );
    }

    
}