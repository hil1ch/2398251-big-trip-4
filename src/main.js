import TripInfoView from './view/trip-info-view.js';
import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import MockService from './service/mock-service.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import PointsModel from './model/points-model.js';

import { render, RenderPosition } from './framework/render.js';

const tripInfoElement = document.querySelector('.trip-main');
const filterElement = tripInfoElement.querySelector('.trip-controls__filters');
const mainElement = document.querySelector('.page-main');
const eventListElement = mainElement.querySelector('.trip-events');

const mockService = new MockService();
const destinationsModel = new DestinationsModel(mockService);
const offersModel = new OffersModel(mockService);
const pointsModel = new PointsModel(mockService);

const boardPresenter = new BoardPresenter({
  container: eventListElement,
  destinationsModel,
  offersModel,
  pointsModel
});

const filterPresenter = new FilterPresenter({
  container: filterElement,
  pointsModel
});

render(new TripInfoView(), tripInfoElement, RenderPosition.AFTERBEGIN);

boardPresenter.init();
filterPresenter.init();
