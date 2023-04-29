<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# API Documentation for QR Code Generator

This API allows you to generate QR codes with a variety of customization options.

## Endpoints

### POST `/qr`

This endpoint generates a QR code image based on the parameters passed in the request body.

#### Request Body

The request body should be in JSON format and may contain the following properties:

- `data` (string, required): The data to be encoded in the QR code.
- `size` (number, optional): The size of the QR code image in pixels. Default is 256 pixels.
- `typeNumber` (number, optional): The QR code type number. Default is 4.
- `errorCorrectionLevel` (string, optional): The error correction level. Default is 'L'.
- `options` (object, optional): An object containing additional options for customizing the appearance of the QR code.

##### Options Object

The `options` object may contain the following properties:

- `shapeStyle` (string, optional): The shape style for the QR code. Valid values are "square", "dot", and "rounded". Default is "square".
- `positionMarkerShape` (string, optional): The shape style for the position markers in the QR code. Valid values are "square", "dot", and "rounded". Default is "square".
- `color` (string, optional): The color of the QR code. Default is "black".
- `border` (object, optional): An object containing options for the QR code border.
  - `width` (number, optional): The width of the border in pixels. Default is 1.
  - `color` (string, optional): The color of the border. Default is "white".
- `background` (string, optional): The background color of the QR code. Default is "white".
- `logo` (object, optional): An object containing options for a logo image to be overlayed on the QR code.
  - `url` (string, required): The URL of the logo image.
  - `maxSize` (number, optional): The maximum size of the logo image in pixels. Default is infinity.
  - `opacity` (number, optional): The opacity of the logo image. Value should be between 0 and 1. Default is 1.
  - `proportion` (number, optional): The proportion of the QR code size that the logo image should occupy. Value should be between 0 and 2. Default is 1.
- `gradient` (object, optional): An object containing options for a gradient to be applied to the QR code.
  - `type` (string, required): The type of gradient. Valid values are "linear" and "area".
  - `startColor` (string, required): The color at the start of the gradient.
  - `endColor` (string, required): The color at the end of the gradient.
  - `angleDegrees` (number, optional): The angle in degrees for a linear gradient. Default is 0.

#### Response

The response is a PNG image of the generated QR code.

## Error Handling

If the request body is missing the `data` property, the API will respond with a 400 Bad Request status and a message indicating that the `data` property is required.

If an error occurs during QR code generation, the API will respond with a 500 Internal Server Error status and an error message.
