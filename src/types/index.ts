/// Базовые типы данных
export type Category = 'софт-скил' | 'хард-скил' | 'дополнительное' | 'кнопка' | 'другое';

export interface IProduct {
    id: string;
    description?: string;
    image: string;
    tittle: string;
    category: Category;
    price: number | string;
}

export interface IBasket {
    items: IProduct;
    counter: number;
}

export interface IOrderForm {
    email: string;
    phone: string;
    payment: string;
    address: string;
    total: number | string;
}

export interface IOrder extends IOrderForm {
    items: string[]
}

export interface IAppState {
    catalog: IProduct[];
    basket: string[];
    order: IOrder | null;
    loading: boolean;
}

export interface IOrderResult {
    id: string;
}

export interface ILarekAPI {
    getCardList: () => Promise<IProduct[]>;
    orderProducts: (order: IOrder) => Promise<IOrderResult>;
}

export interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;