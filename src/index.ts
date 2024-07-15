import './scss/styles.scss';
import { AuctionAPI } from './components/LarekAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import {AppState, CatalogChangeEvent, ProductItem,} from './components/AppData';
import { EventEmitter } from './components/base/events';
import { Page } from './components/Page';
import { Card } from './components/Card';
import { Modal } from './components/common/Modal';
import { Basket } from './components/Basket';
import { Order } from './components/Order';
import { IOrderForm } from './types';
import { Success } from './components/Success';

const events = new EventEmitter();

const api = new AuctionAPI(CDN_URL, API_URL);
const appData = new AppState({}, events);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const contacts = new Order(cloneTemplate(contactsTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);

// Рендер каталога
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category,
		});
	});
});

// Превью карточки
events.on('card:select', (item: ProductItem) => {
	const preview = new Card('card', cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			events.emit('basket:submit', item), (preview.buttonToggle = false);
		},
	});
	let buttonVisibility: boolean;
	if (appData.checkItemInBasket(item.id)) {
		buttonVisibility = false;
	} else buttonVisibility = true;
	modal.render({
		content: preview.render({
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category,
			buttonToggle: buttonVisibility,
		}),
	});
});

// Добавление в корзину
events.on('basket:submit', (item: ProductItem) => {
	appData.addItemToBasket(item);
	page.counter = appData.getcatalog().length;
	basket.items = appData.getcatalog().map((item, index) => {
		basket.total = appData.getTotal();
		const card = new Card('card', cloneTemplate(cardBasketTemplate), {
			onClick: () => events.emit('card:delete', item),
		});
		return card.render({
			title: item.title,
			price: item.price,
            index: index + 1,
		});
	});
});

// Открытие корзины
events.on('basket:open', () => {
	modal.render({
		content: basket.render(),
	});
});

/// Удаление в корзине
events.on('card:delete', (item: ProductItem) => {
	appData.deleteItem(item.id);
	page.counter = appData.getcatalog().length;
	basket.items = appData.getcatalog().map((item, index) => {
		basket.total = appData.getTotal();
		const card = new Card('card', cloneTemplate(cardBasketTemplate), {
			onClick: () => events.emit('card:delete', item),
		});
		return card.render({
			title: item.title,
			price: item.price,
            index: index + 1,
		});
	});
	basket.total = appData.getTotal();
});

/// Открытие первой формы заказа
events.on('order:open', () => {
	order.initializePaymentButtons();
	modal.render({
		content: order.render({
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

/// Открытие второй формы заказа
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: true,
			errors: [],
		}),
	});
});

/// Валидация первой формы
events.on('formErrors:Order', (errors: Partial<IOrderForm>) => {
	const { address, payment } = errors;
	order.valid = !address && !payment;
	order.errors = Object.values({ address, payment }).filter((i) => !!i).join('; ');
});

/// Валидация второй формы
events.on('formErrors:Contacts', (errors: Partial<IOrderForm>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ email, phone }).filter((i) => !!i).join('; ');
});

/// Добавление данных
events.on(/^.*:change$/, (data: { field: keyof IOrderForm; value: string }) => {
	appData.setOrderField(data.field, data.value);
});

/// Отправка заказа, рендер финальной формы, очистка корзины
events.on('contacts:submit', () => {
	appData.order.total = appData.getTotal();
	api.orderLots(appData.order)
		.then((result) => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
				},
			});
			modal.render({
				content: success.render({
					total: appData.getTotal(),
				}),
			});
			appData.clearBasket();
			page.counter = appData.getcatalog().length;
			basket.items = [];
			basket.total = appData.getTotal();
			console.log(result);
		})
		.catch((err) => {
			console.error(err);
		});
});

/// Блокирование прокрутки
events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

/// Получение данных для рендера карточек
api.getCardList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});
