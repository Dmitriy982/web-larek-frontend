import {Form} from "./common/Form";
import {IOrderForm} from "../types";
import {EventEmitter, IEvents} from "./base/events";


export class Order extends Form<IOrderForm> {
    protected _buttonNext?: HTMLButtonElement;
    protected _buttons?: NodeList;
    
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._buttonNext = container.querySelector(`.order__button`);
        this._buttons = container.querySelectorAll('.order__buttons button');
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
        this._buttons.forEach(button => {
            if (button instanceof HTMLButtonElement) {
                button.addEventListener('click', () => {
                    this.setActiveButton(button);
                });
            }
        });
    }

    setActiveButton(activeButton: HTMLButtonElement) {
        this._buttons.forEach(button => {
            if (button instanceof HTMLButtonElement) {
                this.toggleClass(button, 'button_alt-active', false);
            }
        });
        this.toggleClass(activeButton, 'button_alt-active', true);
        if (activeButton.name === 'card') {
            this.onInputChange('payment', 'online');
        } else if (activeButton.name === 'cash') {
            this.onInputChange('payment', 'ofline');
        }
    }
}