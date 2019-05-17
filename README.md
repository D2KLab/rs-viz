# RS-viz

RS-viz is a Web-based tool for graphically visualizing the main characteristics of a rating dataset.

## Demo

A demo of RS-viz is available at [http://datascience.ismb.it/rs-viz/](http://datascience.ismb.it/rs-viz/).

## Installation

After cloning the repository, it is necessary to install the dependencies.

```bash
$ npm install
```

Then, it is possible to generate a bundled JavaScript file with [webpack](https://webpack.js.org/).

```bash
$ npm run build
```

## Usage

The resulting code is available in the `./dist` directory which can be published with any web server.
To serve it with an embedded web server you can run the following command.

```bash
$ npm start
```

## Team

- Diego Monti <diego.monti@polito.it>
- Giuseppe Rizzo <giuseppe.rizzo@ismb.it>
- Maurizio Morisio <maurizio.morisio@polito.it>
