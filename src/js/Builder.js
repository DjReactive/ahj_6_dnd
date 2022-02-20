import Dragger from './Dragger';

export default class Builder {
  constructor(storage) {
    this.draggedEl = null;
    this.ghostEl = null;
    this.items = [];
    this.counterId = 0;
    this.storage = storage;
    this.todo = document.getElementById('todo');
    this.inProgress = document.getElementById('inprogress');
    this.done = document.getElementById('done');

    this.todoAdd = Builder.getElementColumn(this.todo, 'add');
    this.inProgressAdd = Builder.getElementColumn(this.inProgress, 'add');
    this.doneAdd = Builder.getElementColumn(this.done, 'add');
  }

  init() {
    const load = this.storage.load();
    if (load) this.items = load;
    [this.todoAdd, this.inProgressAdd, this.doneAdd].forEach((el) => {
      this.addStartElements(el);
    });
    this.refresh();
  }

  refresh() {
    const allCards = document.getElementsByClassName('card');
    Array.from(allCards).forEach((e) => e.remove());

    this.items.forEach((item) => {
      const list = document.getElementById(item.list).querySelector('.list');
      this.addAnotherCard(list, item.value, item.id);
    });
    if (this.items.length > 0) this.counterId = this.items[this.items.length - 1].id;
  }

  addStartElements(el) {
    const td = el.closest('td');
    const div = Builder.addElement(el, 'div',
      { class: 'add-card hidden' });
    const input = Builder.addElement(div, 'textarea',
      { style: 'resize: none' });
    const butAdd = Builder.addElement(div, 'button',
      { class: 'button-add', textContent: 'Add Card' });
    const butClose = Builder.addElement(div, 'button',
      { class: 'button-close', textContent: '\u{1F5D9}' });
    const link = Builder.addElement(el, 'a',
      { class: 'show-div', textContent: '\u{002B} Add another card' });

    // Add events
    document.addEventListener('mousedown', (e) => Dragger.mousedown(e));
    document.addEventListener('mousemove', (e) => Dragger.mousemove(e));
    document.addEventListener('mouseup', (e) => Dragger.mouseup(e, this));

    butClose.addEventListener('click', () => Builder.hideAddInputCase(div, link));
    link.addEventListener('click', () => Builder.showAddInputCase(div, link));
    butAdd.addEventListener('click', () => {
      const cardId = this.generateId();
      this.items.push({
        id: cardId,
        list: td.getAttribute('id'),
        value: input.value,
      });
      this.addAnotherCard(td.querySelector('.list'), input, cardId);
      Builder.hideAddInputCase(div, link);
      this.saveItems();
    });
  }

  addAnotherCard(list, input, id = null) {
    const cardId = id || this.generateId();
    const isInput = (typeof input !== 'string');
    const value = isInput ? input.value : input;
    const card = Builder.addElement(list, 'div',
      { class: 'card', 'data-id': `${cardId}`, textContent: value });
    const removeBut = Builder.addElement(card, 'button',
      { class: 'remove', textContent: '\u{1F5D9}' });

    removeBut.addEventListener('click', () => this.removeAnotherCard(card));
    if (isInput) input.value = '';
  }

  removeAnotherCard(card) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].id === Number(card.dataset.id)) {
        this.items.splice(i, 1);
        card.remove();
        this.saveItems();
        return true;
      }
    }
    return false;
  }

  generateId() {
    this.counterId += 1;
    return this.counterId;
  }

  resortingItems() {
    const items = document.getElementsByClassName('card');
    const newArray = [];
    Array.from(items).forEach((item) => {
      const arrItem = this.items.find((i) => String(i.id) === item.dataset.id);
      if (arrItem) {
        arrItem.list = item.closest('td').getAttribute('id');
        newArray.push(arrItem);
      }
    });
    this.items = newArray;
    this.saveItems();
    this.refresh();
  }

  saveItems() {
    this.storage.save(this.items);
  }

  static addElement(parent, tag, attr = {}) {
    const el = document.createElement(tag);
    for (const key of Object.keys(attr)) {
      switch (key) {
        case 'textContent':
          el.textContent = attr[key];
          break;
        default:
          el.setAttribute(key, attr[key]);
          break;
      }
    }
    parent.appendChild(el);
    return el;
  }

  static showAddInputCase(div, link) {
    link.classList.add('hidden');
    div.classList.remove('hidden');
  }

  static hideAddInputCase(div, link) {
    link.classList.remove('hidden');
    div.classList.add('hidden');
  }

  static getElementColumn(tdElement, classname = 'list') {
    return tdElement.querySelector(`.${classname}`);
  }
}
