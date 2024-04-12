import AbstractView from '../framework/view/abstract-view.js';

function createEmptyListViewTemplate() {
  return (
    `<section class="trip-events">
        <h2 class="visually-hidden">Trip events</h2>
        <p class="trip-events__msg">Click New Event to create your first point</p>
    </section>`
  );
}

export default class EmptyListView extends AbstractView {
  get template() {
    return createEmptyListViewTemplate();
  }
}
