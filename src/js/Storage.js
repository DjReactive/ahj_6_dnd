export default class Storage {
  constructor(storage) {
    this.storage = storage;
  }

  save(saveObj) {
    this.storage.setItem('items', JSON.stringify(saveObj));
  }

  load() {
    try {
      return JSON.parse(this.storage.getItem('items'));
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}
