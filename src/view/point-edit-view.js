import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { POINT_EMPTY, EditType, ButtonLabel } from '../const.js';
import { formatStringToDateTime } from '../util.js';
import 'flatpickr/dist/flatpickr.min.css';
import flatpickr from 'flatpickr';
import he from 'he';

function createSaveButtonTemplate({ isSaving, isDisabled }) {
  const label = isSaving ? ButtonLabel.SAVE_IN_PROGRESS : ButtonLabel.SAVE_DEFAULT;
  return `<button class="event__save-btn btn btn--blue" type="submit"${(isDisabled) ? 'disabled' : ''}>${label}</button>`;
}

function createResetButtonTemplate({ pointType, isDeleting, isDisabled }) {
  let label;

  if (pointType === EditType.CREATING) {
    label = ButtonLabel.CANCEL_DEFAULT;
    return `<button class="event__reset-btn btn" type="reset"><span ${(isDisabled) ? 'disabled' : ''}>${label}</span></button>`;
  } else {
    label = isDeleting ? ButtonLabel.DELETE_IN_PROGRESS : ButtonLabel.DELETE_DEFAULT;
    return `<button class="event__reset-btn btn" type="reset" ${(isDisabled) ? 'disabled' : ''}>${label}</button>`;
  }
}

function createRollupButtonTemplate(isDisabled) {
  return `
    <button class="event__rollup-btn" type="button"><span class="visually-hidden"${(isDisabled) ? 'disabled' : ''}>Open event</span></button>
  `;
}

function createPointEditControlsTemplate({ pointType, isSaving, isDeleting, isDisabled }) {
  return `
    ${createSaveButtonTemplate({ isSaving, isDisabled })}
    ${createResetButtonTemplate({ pointType, isDeleting, isDisabled })}
    ${(pointType === EditType.EDITING) ? createRollupButtonTemplate(isDisabled) : ''}
  `;
}

function createPointCitiesOptionsTemplate({ pointDestination, isDisabled }) {
  return `
    <datalist id="destination-list-1"${(isDisabled) ? 'disabled' : ''}>
      ${pointDestination.map(({ name }) => `<option value="${name}"></option>`).join('')}
    </div>`;
}

function createPointPhotosTemplate(pointDestination) {
  return (
    (pointDestination.pictures && pointDestination.pictures.length) ?
      `<div class="event__photos-tape">
      ${pointDestination.pictures.map((picture) =>
      `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`
    ).join('')}
  </div>`
      : ''
  );
}

function createPointTypesTemplate({ currentType, isDisabled, pointOffers }) {
  return pointOffers.map(({type}) =>
    `<div class="event__type-item">
        <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${currentType === type ? 'checked' : ''} ${(isDisabled) ? 'disabled' : ''}>
        <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
      </div>`).join('');
}

function createPointOffersTemplate({ offersId, currentOffers }) {
  const offerItems = currentOffers.map((offer) => {
    const isChecked = offersId.includes(offer.id) ? 'checked' : '';

    return (
      `<div class="event__offer-selector">
        <input class="event__offer-checkbox  visually-hidden" id="${offer.id}" type="checkbox" name="event-offer-luggage" ${isChecked}>
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

function createPointEditTemplate({ state, pointDestination, pointOffers, pointType }) {
  const { point, isSaving, isDeleting, isDisabled } = state;
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
          <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox"${(isDisabled) ? 'disabled' : ''}>
          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${createPointTypesTemplate({ type, isDisabled, pointOffers })}
            </fieldset>
          </div>
        </div>
        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-1">
            ${type}
          </label>
          <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination ? he.encode(currentDestination.name) : ''}" list="destination-list-1"${(isDisabled) ? 'disabled' : ''}>
          ${createPointCitiesOptionsTemplate({pointDestination, isDisabled})}
        </div>
        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${point.dateFrom ? formatStringToDateTime(dateFrom) : ''}"${(isDisabled) ? 'disabled' : ''}>
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${point.dateTo ? formatStringToDateTime(dateTo) : ''}"${(isDisabled) ? 'disabled' : ''}>
        </div>
        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${he.encode(String(basePrice))}" ${(isDisabled) ? 'disabled' : ''}>
        </div>
        ${createPointEditControlsTemplate({ pointType, isSaving, isDeleting, isDisabled })}
      </header>
      <section class="event__details">
        ${(currentOffers.length) ? `<section class="event__section  event__section--offers">
          <h3 class="event__section-title  event__section-title--offers">Offers</h3>

          ${createPointOffersTemplate({ offersId: point.offers, currentOffers })}

        </section>` : ''}
        ${(currentDestination) ? `${(currentDestination.description.length || currentDestination.pictures.length) ? `<section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${currentDestination.description}</p>
          <div class="event__photos-container">
            ${createPointPhotosTemplate(currentDestination)}` : ''}
          </div>
        </section>` : ''}
      </section>
    </form>
  </li>`);
}

export default class PointEditView extends AbstractStatefulView {
  #pointDestination = null;
  #pointOffers = null;
  #handleSubmitClick = null;
  #handleResetClick = null;
  #handleDeleteClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;
  #pointType;

  constructor({ point = POINT_EMPTY, pointDestination, pointOffers, onSubmitClick, onResetClick, onDeleteClick, pointType = EditType.EDITING }) {
    super();
    this.#pointDestination = pointDestination;
    this.#pointOffers = pointOffers;
    this.#handleSubmitClick = onSubmitClick;
    this.#handleResetClick = onResetClick;
    this.#handleDeleteClick = onDeleteClick;
    this.#pointType = pointType;

    this._setState(PointEditView.parsePointToState({ point }));
    this._restoreHandlers();
  }

  get template() {
    return createPointEditTemplate({
      state: this._state,
      pointDestination: this.#pointDestination,
      pointOffers: this.#pointOffers,
      pointType: this.#pointType
    });
  }

  reset = (point) => this.updateElement({ point });

  removeElement = () => {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  };

  _restoreHandlers = () => {
    if (this.#pointType === EditType.EDITING) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#rollUpClickHandler);
      this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);
    }

    if (this.#pointType === EditType.CREATING) {
      this.element.querySelector('.event__reset-btn').addEventListener('click', this.#resetClickHandler);
    }

    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);

    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);

    this.element.querySelector('.event__available-offers')?.addEventListener('change', this.#offerChangeHandler);

    this.element.querySelector('.event__input--price').addEventListener('change', this.#priceChangeHandler);

    this.#setDatepickers();
  };

  checkFormValidation = () => {
    const { point } = this._state;
    const isValid = point.basePrice > 0 && point.dateFrom && point.dateTo && point.destination;
    this.updateElement({ isSaveButtonDisabled: !isValid });
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(PointEditView.parseStateToPoint(this._state));
  };

  #resetClickHandler = (evt) => {
    const disabledSavingButton = document.querySelector('.event__save-btn[disabled]');
    evt.preventDefault();
    if (!disabledSavingButton) {
      this.#handleResetClick();
    }
  };

  #formSubmitHandler = async (evt) => {
    evt.preventDefault();
    await this.#handleSubmitClick(PointEditView.parseStateToPoint(this._state));
    this._setState({
      isSavingCompleted: true
    });
  };

  #rollUpClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleResetClick();
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
    const selectedDestination = this.#pointDestination.find((destination) => destination.name === evt.target.value);
    const selectedDestinationId = (selectedDestination) ? selectedDestination.id : null;

    this.updateElement({
      point: {
        ...this._state.point,
        destination: selectedDestinationId
      }
    });

    this.checkFormValidation();
  };

  #offerChangeHandler = () => {
    const checkedBoxes = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked'));

    this._setState({
      point: {
        ...this._state.point,
        offers: checkedBoxes.map((element) => element.id)
      }
    });
  };

  #priceChangeHandler = (evt) => {
    this._setState({
      point: {
        ...this._state.point,
        basePrice: evt.target.value
      }
    });
  };

  #dateFromOpenHandler = () => {
    const today = new Date();
    this.#datepickerFrom.setDate(today);
  };

  #dateFromCloseHandler = ([userDate]) => {
    this._setState({
      point: {
        ...this._state.point,
        dateFrom: userDate
      }
    });

    this.#datepickerTo.set('minDate', this._state.point.dateFrom);
  };

  #dateToCloseHandler = ([userDate]) => {
    this._setState({
      point: {
        ...this._state.point,
        dateTo: userDate
      }
    });

    this.#datepickerFrom.set('maxDate', this._state.point.dateTo);
  };

  #setDatepickers = () => {
    const [dateFromElement, dateToElement] = this.element.querySelectorAll('.event__input--time');
    const commonConfig = {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      locale: {
        firstDayOfWeek: 1,
      },
      'time_24hr': true
    };

    this.#datepickerFrom = flatpickr(
      dateFromElement,
      {
        ...commonConfig,
        defaultDate: this._state.point.dateFrom,
        onClose: this.#dateFromCloseHandler,
        onOpen: () => { this.#dateFromOpenHandler(); },
        maxDate: this._state.point.dateTo,
      },
    );

    this.#datepickerTo = flatpickr(
      dateToElement,
      {
        ...commonConfig,
        defaultDate: this._state.point.dateTo,
        onClose: this.#dateToCloseHandler,
        maxDate: this._state.point.dateFrom,
      },
    );
  };

  static parsePointToState = ({
    point,
    isDisabled = false,
    isSaving = false,
    isDeleting = false,
    isSavingCompleted = false
  }) => ({
    point,
    isDisabled,
    isSaving,
    isDeleting,
    isSavingCompleted
  });

  static parseStateToPoint = (state) => state.point;
}
