# FamilyCalendar

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Dockerization - Quick start

Fichiers de configuration nécessaires côté serveur :

* frontend/config/family-calendar.nikouz.fr-le-ssl-host-proxy.conf
* ssl/fullchain.pem
* ssl/privkey.pem

```bash
  cd (...)/family-calendar
  docker build -t family-calendar-frontend -f ./frontend/Dockerfile ./frontend
  docker stop family-calendar-frontend
  docker run --rm --name family-calendar-frontend \
    -dp 4200:80 \
    family-calendar-frontend

  docker logs family-calendar-frontend
  docker tag family-calendar-frontend nicolasmura/family-calendar-frontend
  docker push nicolasmura/family-calendar-frontend

  # Start / stop the container with its name
  docker start family-calendar-frontend
  docker stop family-calendar-frontend

  # Running our Image on a New Instance
  docker run --rm --name family-calendar-frontend \
    -dp 4200:80 \
    nicolasmura/family-calendar-frontend

  # Test
  docker exec -it family-calendar-frontend bash

  # Start up the whole application (front + back + mongodb) stack using the docker-compose
  docker-compose -f docker-compose.yml --env-file ./backend/.env up
  docker-compose -f docker-compose.yml --env-file ./backend/.env up -d
  docker-compose -f docker-compose.yml --env-file ./backend/.env up -d --build

  docker-compose -f docker-compose.yml --env-file ./backend/.env up -d --build
  docker-compose -f docker-compose.prod.yml --env-file ./backend/.env up -d --build

  docker-compose -f docker-compose.yml --env-file ./backend/.env down
  docker-compose -f docker-compose.prod.yml --env-file ./backend/.env down

  # Test
  docker exec -it frontend bash
```

## TODO

  * Icons iOS + message for landscape mode (ex.: not supported)
  * Splashscreen
  * CI avec Harness (https://harness.io/)
  * Cache icons
  * Move subscriptions to Push Notification from Firebase (Realtime Database) to nicolasmura.com