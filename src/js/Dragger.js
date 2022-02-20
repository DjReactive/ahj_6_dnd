export default class Dragger {
  static selectedItem = null;

  static draggedItem = null;

  static copyItem = null;

  static ghostItem = null;

  static ghostPosition = null;

  static ghostFixed = null;

  static startX = 0;

  static startY = 0;

  static timeOut = 0;

  // args: Builder, event on drag
  static mousedown(e) {
    const { target } = e;
    if (!target.classList.contains('card') || Dragger.selectedItem) return;
    if (e.button !== 0) return;

    Dragger.copyItem = target;
    Dragger.selectedItem = target;
    Dragger.selectedItem.classList.add('selected');
    Dragger.draggedItem = target.cloneNode(true);
    Dragger.draggedItem.classList.add('dragged');
    Dragger.selectedItem.innerHTML = '';
    const width = Dragger.selectedItem.offsetWidth;
    const height = Dragger.selectedItem.offsetHeight;
    const rect = Dragger.selectedItem.getBoundingClientRect();
    const { scrollLeft, scrollTop } = document.body;
    const left = rect.left + scrollLeft;
    const top = rect.top + scrollTop;
    Dragger.startX = e.clientX;
    Dragger.startY = e.clientY;
    Dragger.draggedItem.style.width = `${width}px`;
    Dragger.draggedItem.style.height = `${height}px`;
    Dragger.draggedItem.style.top = `${top}px`;
    Dragger.draggedItem.style.left = `${left}px`;

    Dragger.ghostPosition = Dragger.selectedItem.closest('td');

    document.body.style.cursor = 'grabbing';
    document.body.appendChild(Dragger.draggedItem);
    Dragger.mouseDown = true;
  }

  static mousemove(e) {
    if (!Dragger.selectedItem) return;

    switch (true) {
      case (e.target.classList.contains('card')):
        Dragger.ghostThink(e, 'onCard');
        break;
      case (e.target.classList.contains('list')):
        Dragger.ghostThink(e, 'onList');
        break;
      case (e.target === e.target.closest('td')):
        Dragger.ghostThink(e, 'onTable');
        break;
      default:
        Dragger.ghostRemove();
        break;
    }

    let y = 0;
    const rect = Dragger.selectedItem.getBoundingClientRect();
    const { scrollLeft, scrollTop } = document.body;
    if (Dragger.ghostItem
    && Dragger.ghostItem.parentNode === Dragger.selectedItem.parentNode
    && Dragger.ghostItem.offsetTop < Dragger.startY) {
      y = Dragger.ghostItem.offsetHeight + 10; // margin - не знаю как получить
    }
    const left = rect.left + scrollLeft + e.clientX - Dragger.startX;
    const top = rect.top + scrollTop + e.clientY - Dragger.startY - y;

    Dragger.draggedItem.style.top = `${top}px`;
    Dragger.draggedItem.style.left = `${left}px`;
  }

  static mouseup(e, b) {
    if (!Dragger.selectedItem) return;

    const x = e.clientX;
    const y = e.clientY;
    Dragger.draggedItem.style.display = 'none';
    const changingItem = document.elementFromPoint(x, y);
    if (changingItem && e.target !== Dragger.selectedItem) {
      const parent = changingItem.closest('td');
      if (parent) {
        const list = parent.querySelector('.list');
        if (list === Dragger.selectedItem.parentNode) {
          list.replaceChild(Dragger.selectedItem, Dragger.ghostItem);
        } else {
          Dragger.selectedItem.remove();
          Dragger.ghostItem.insertAdjacentElement('afterend', Dragger.copyItem);
        }
      }
    }
    Dragger.selectedItem.innerHTML = Dragger.draggedItem.innerHTML;
    Dragger.selectedItem.classList.remove('selected');
    Dragger.selectedItem = null;
    Dragger.draggedItem.remove();
    Dragger.draggedItem = null;
    Dragger.ghostRemove();
    Dragger.ghostItem = null;
    Dragger.ghostPosition = null;
    Dragger.ghostFixed = null;
    Dragger.copyItem = null;

    document.body.style.cursor = 'default';
    b.resortingItems();
  }

  static ghostThink(e, type) {
    // if (Dragger.timeOut < Date.now())
    Dragger.ghostElement(e, type);
  }

  static ghostElement(e, type) {
    if (!type) return;
    if (e.target === Dragger.ghostItem) return;

    Dragger.ghostRemove();
    if (e.target === Dragger.selectedItem) return;

    const ghost = document.createElement('div');
    const { target } = e;
    ghost.classList.add('card');
    ghost.classList.add('selected');
    ghost.textContent = 'Put Here!';

    let next;
    const centerY = target.offsetTop + (target.offsetHeight / 2);
    const shift = (centerY > e.clientY) ? 'beforebegin' : 'afterend';
    const items = target.getElementsByClassName('card');
    const list = target.querySelector('.list');

    switch (type) {
      case 'onCard':
        target.insertAdjacentElement(shift, ghost);
        break;
      case 'onList':
        Array.from(items).forEach((i) => {
          if (i.offsetTop < e.clientY) next = i;
        });
        if (next) next.insertAdjacentElement('afterend', ghost);
        break;
      case 'onTable':
        if (list) list.insertAdjacentElement('afterend', ghost);
        break;
      default:
        break;
    }

    Dragger.ghostFixed = type;
    Dragger.ghostItem = ghost;
  }

  static ghostRemove() {
    if (Dragger.ghostItem) Dragger.ghostItem.remove();
  }
}
