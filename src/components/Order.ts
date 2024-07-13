import {Form} from "./common/Form";
import {IOrderForm} from "../types";
import {EventEmitter, IEvents} from "./base/events";


export class Order extends Form<IOrderForm> {
    protected _buttonNext?: HTMLButtonElement;
    
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._buttonNext = container.querySelector(`.order__button`);
    }


    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    initializePaymentButtons() {
        const buttons = this.container.querySelectorAll('.order__buttons button');
        buttons.forEach(button => {
            if (button instanceof HTMLButtonElement) {
                button.addEventListener('click', () => {
                    this.setActiveButton(button);
                });
            }
        });
    }

    setActiveButton(activeButton: HTMLButtonElement) {
        const buttons = this.container.querySelectorAll('.order__buttons button');
        buttons.forEach(button => {
            if (button instanceof HTMLButtonElement) {
                button.classList.remove('button_alt-active');
            }
        });
        activeButton.classList.add('button_alt-active');
        if (activeButton.name === 'card') {
            this.onInputChange('payment', 'online');
        } else if (activeButton.name === 'cash') {
            this.onInputChange('payment', 'ofline');
        }
    }
}