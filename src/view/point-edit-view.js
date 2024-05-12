import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { CITIES, POINT_EMPTY, TYPES } from '../const.js';
import { formatStringToDateTime} from '../util.js';

function createPointCitiesOptionsTemplate() {
  return `
    <datalist id="destination-list-1">
      ${CITIES.map((city) => `<option value="${city}"></option>`).join('')}
    </div>`;
}

function createPointPhotosTemplate(pointDestination) {
  return `
    <div class="event__photos-tape">
      ${pointDestination.pictures.map((picture) =>
    `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('')}
    </div>`;
}

function createPointTypesTemplate(currentType) {
  return TYPES.map((type) =>
    `<div class="event__type-item">
        <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${currentType === type ? 'checked' : ''}>
        <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
      </div>`).join('');
}

function createPointOffersTemplate({currentOffers}) {
  const offerItems = currentOffers.map((offer) => {
    const isChecked = offer.included ? 'checked' : '';

    return (
      `<div class="event__offer-selector">
        <input class="event__offer-checkbox  visually-hidden" id="${offer.id}" type="checkbox" name="event-offer-luggage" ${isChecked ? 'checked' : ''}>
        <label class="event__offer-label" for="${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>`
    );
  }).join('');

  return `<div class="event__available-offers">${offerItems}</div>`;
}

function createPointEditTemplate({ state, pointDestination, pointOffers }) {
  const {point} = state;
  const { basePrice, dateFrom, dateTo, type } = point;

  const currentDestination = pointDestination.find((destination) => destination.id === point.destination);
  const currentOffers = pointOffers.find((offer) => offer.type === type).offers;

  return (`
  <li class="trip-events__item">
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${createPointTypesTemplate(type)}
            </fieldset>
          </div>
        </div>
        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-1">
            ${type}
          </label>
          <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination.name}" list="destination-list-1">
          ${createPointCitiesOptionsTemplate()}
        </div>
        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatStringToDateTime(dateFrom)}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatStringToDateTime(dateTo)}">
        </div>
        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
        </div>
        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Cancel</button>
      </header>
      <section class="event__details">
        ${(currentOffers.length !== 0) ? `<section class="event__section  event__section--offers">
          <h3 class="event__section-title  event__section-title--offers">Offers</h3>

          ${createPointOffersTemplate({ currentOffers })}

        </section>` : ''}
        ${(currentDestination) ? `<section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${currentDestination.description}</p>
          <div class="event__photos-container">
            ${createPointPhotosTemplate(currentDestination)}` : ''}
          </div>
        </section>
      </section>
    </form>
  </li>`);
}

export default class PointEditView extends AbstractStatefulView {
  #pointDestination = null;
  #pointOffers = null;
  #handleSubmitClick = null;
  #handleResetClick = null;

  constructor({point = POINT_EMPTY, pointDestination, pointOffers, onSubmitClick, onResetClick}) {
    super();
    this.#pointDestination = pointDestination;
    this.#pointOffers = pointOffers;
    this.#handleSubmitClick = onSubmitClick;
    this.#handleResetClick = onResetClick;

    this._setState(PointEditView.parsePointToState({point}));

    this._restoreHandlers();
  }

  get template() {
    return createPointEditTemplate({
      state: this._state,
      pointDestination: this.#pointDestination,
      pointOffers: this.#pointOffers
    });
  }

  reset = (point) => this.updateElement({point});

  _restoreHandlers = () => {
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#resetClickHandler);

    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);

    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);

    this.element.querySelector('.event__available-offers')?.addEventListener('change', this.#offerChangeHandler);

    this.element.querySelector('.event__input--price').addEventListener('change', this.#priceChangeHandler);
  };

  #resetClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleResetClick();
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleSubmitClick(PointEditView.parseStateToPoint(this._state));
  };

  #typeChangeHandler = (evt) => {
    this.updateElement({
      point: {
        ...this._state.point,
        type: evt.target.value,
        offers: []
      }
    });
  };

  #destinationChangeHandler = (evt) => {
    const selectedDestination = this.#pointDestination.find((pointDestination) => pointDestination.name === evt.target.value);
    const selectedDestinationId = (selectedDestination) ? selectedDestination.id : null;

    this.updateElement({
      point: {
        ...this._state.point,
        destination: selectedDestinationId
      }
    });
  };

  #offerChangeHandler = () => {
    const checkedBoxes = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked'));

    this._setState({
      point: {
        ...this._state.point,
        offers: checkedBoxes.map((element) => element.dataset.offerId)
      }
    });
  };

  #priceChangeHandler = (evt) => {
    this._setState({
      point: {
        ...this._state.point,
        basePrice: evt.target.valueAsNumber
      }
    });
  };

  static parsePointToState = ({point}) => ({point});
  static parseStateToPoint = (state) => state.point;
}
