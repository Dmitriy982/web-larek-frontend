import {Component} from "./base/Components";
import {bem, createElement, ensureElement, formatNumber} from "../utils/utils";
import { Category } from "../types";

export interface ICard<T> {
    id: string;
    title: string;
    description?: string | string[];
    price: number;
    image: string;
    category: Category;
    buttonToggle: boolean;
}

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export class Card<T> extends Component<ICard<T>> {
    protected categoryClassMap: { [value: string]: string} = {
        'софт-скил': 'soft',
        'хард-скил': 'hard',
        'дополнительное': 'additional',
        'кнопка': 'button',
        'другое': 'other'
    };
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _price: HTMLElement;
    protected _category: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._image = container.querySelector(`.${blockName}__image`);
        this._button = container.querySelector(`.${blockName}__button`);
        this._description = container.querySelector(`.${blockName}__text`);
        this._price = container.querySelector(`.${blockName}__price`);
        this._category = container.querySelector(`.${blockName}__category`);
        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: string) {
        if (value == null){
            this.setText(this._price, 'Бесценно');
        }
        else{
            this.setText(this._price, value+' синапсов');
        }
        if (this._button && value === null) {
            this._button.disabled = true;
        }
    }

    set buttonToggle (value:boolean) {
        if (value === true && this._button.disabled === false) {
            this._button.disabled = false;
        } 
        else 
        {
            this._button.disabled = true;
        }
    }

    set category(value: string) {
        this.setText(this._category, value);
        this.toggleClass(this._category, `card__category_${this.categoryClassMap[value]}`);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }
    
    set description(value: string[]) {
        this.setText(this._description, value);
    }
    
}
