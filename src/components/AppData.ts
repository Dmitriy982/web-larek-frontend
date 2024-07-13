import {Model} from "./base/model";
import _ from "lodash";
import { Category } from "../types";
import {FormErrors, IAppState, IProduct, IOrder, IOrderForm} from "../types";

export type CatalogChangeEvent = {
    catalog: ProductItem[]
};

interface BasketItem {
    description: string;
    id: string;
    image: string;
    title: string;
    category: Category;
    price: number;
}

export class ProductItem extends Model<IProduct> {
    description: string;
    id: string;
    image: string;
    title: string;
    category: Category;
    price: number;
}

export class AppState extends Model<IAppState> {
    catalog: ProductItem[];
    basket: BasketItem[] = [];
    order: IOrder = {
        email: '',
        phone: '',
        payment: '',
        address: '',
        total: '',
        items: [] 
     };
     
    formErrors: FormErrors = {};
    
    setCatalog(items: IProduct[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    getcatalog(): BasketItem[] {
        return this.basket;
    }


    addItemToBasket(item: BasketItem) {
        this.basket = [item, ...this.basket];
        this.order.items = [item.id, ...this.order.items];
    }

    deleteItem(id: string) {
        this.basket = this.basket.filter(item => item.id !== id);
        this.order.items = this.order.items.filter(itemId => itemId !== id);
    }

    clearBasket() {
        this.basket = [];
        this.order.items = [];
    }
    
    checkItemInBasket(id: string): boolean {
        let itemExists = this.basket.some(item => item.id === id);
        if (itemExists) {
            return true
        } else {
            return false
        }
    }

    getTotal() {
        return this.order.items.reduce((a, c) => a + this.basket.find(it => it.id === c).price, 0)
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        let contain = '';
        this.order[field] = value;
        if (field === 'payment' || field === 'address'){
            contain = 'Order';
            this.validateOrder(contain)}
        else {
            contain = 'Contacts'
            if (this.validateOrder(contain)) {
                this.events.emit('order:ready', this.order);
            }
        };
        
    }

    validateOrder(contain: string) {
        const errors: typeof this.formErrors = {};
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        if (!this.order.payment) {
            errors.payment = 'Необходимо указать способ оплаты';
        }
        this.formErrors = errors;
        this.events.emit(`formErrors:${contain}`, this.formErrors);
        return Object.keys(errors).length === 0;
    }
}