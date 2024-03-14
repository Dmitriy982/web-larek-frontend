/// Базовые типы данных
enum Category {
    'софт-скил',
    'хард-скил',
    'дополнительное',
    'кнопка',
    'другое'
}

interface IProduct {
    id: string;
    description?: string;
    image: string;
    tittle: string;
    category: Category;
    price: number | null;
}

interface IBasket {
    items: IProduct;
    counter: number;
}

interface IPaymentForm {
    payment: 'online' | 'offline';
    addres: string;
}

interface IOrderForm {
    email: string;
    phone: string;
}

interface IOrder extends IOrderForm {
    items: string[]
}

interface IAppState {
    catalog: IProduct[];
    basket: string[];
    order: IOrder | null;
    loading: boolean;
}

export interface ICard<T> {
    title: string;
    description?: string | string[];
    image: string;
    status: T;
}