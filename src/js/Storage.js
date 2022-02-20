export default class Storage {
  constructor(storage) {
    this.storage = storage;
  }

  save(saveObj) {
    this.storage.setItem('tasks', JSON.stringify(saveObj));
  }

  load() {
    try {
      return (this.storage.length > 0)
        ? JSON.parse(this.storage.getItem('tasks')) : false;
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}
