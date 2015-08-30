'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _appRootPath = require('app-root-path');

var _appRootPath2 = _interopRequireDefault(_appRootPath);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _graphlib = require('graphlib');

var _graphlib2 = _interopRequireDefault(_graphlib);

var _fixturesPaths = require('./fixtures/paths');

var _fixturesPaths2 = _interopRequireDefault(_fixturesPaths);

var _fixturesCosts = require('./fixtures/costs');

var _fixturesCosts2 = _interopRequireDefault(_fixturesCosts);

var Trade = (function () {
  function Trade(data) {
    _classCallCheck(this, Trade);

    this.data = _lodash2['default'].assign({
      costs: _fixturesCosts2['default'],
      paths: _fixturesPaths2['default']
    });

    this.costGraph = {};
    this.costMap = {};
    this.pathGraph = {};
    this.pathMap = {};
    this.buildGraphs(data);
  }

  Trade.prototype.buildGraphs = function buildGraphs() {
    var _this = this;

    var options = { directed: false, compound: false, multigraph: false };
    this.pathGraph = new _graphlib2['default'].Graph(options);
    this.costGraph = new _graphlib2['default'].Graph(options);

    data.paths.forEach(function (edge) {
      _this.pathGraph.setEdge(edge.from, edge.to);
    });

    data.costs.forEach(function (edge) {
      _this.costGraph.setEdge(edge.from, edge.to, Number(edge.value));
    });

    this.costMap = _graphlib2['default'].alg.floydWarshall(this.costGraph, function (e) {
      return _this.costGraph.edge(e);
    }, function (e) {
      return _this.costGraph.nodeEdges(e);
    });

    this.pathMap = _graphlib2['default'].alg.floydWarshall(this.pathGraph, function (e) {
      return 1;
    }, function (e) {
      return _this.pathGraph.nodeEdges(e);
    });
  };

  Trade.prototype.getPath = function getPath(from, to) {
    var subMap = this.pathMap[from];
    var path = [];

    path.push(to);
    return buildPath(this.subMap, path, from, to); //Build path recursively
  };

  Trade.prototype.getCost = function getCost(from, to) {
    return this.costMap[from][to].distance;
  };

  Trade.prototype.exportGraph = function exportGraph(graph, map) {
    var formatData = {
      nodes: [],
      links: [],
      map: map
    };

    var nodes = graph.nodes;
    var links = graph.edges;

    _lodash2['default'].forEach(nodes, function (row, key) {
      formatData.nodes.push({
        name: row.v,
        group: key
      });
    });

    _lodash2['default'].forEach(links, function (row) {
      formatData.links.push({
        source: _lodash2['default'].find(formatData.nodes, { name: row.v }).group,
        target: _lodash2['default'].find(formatData.nodes, { name: row.w }).group,
        value: row.value
      });
    });

    _fs2['default'].writeFile(_appRootPath2['default'] + '/d3/graph.json', JSON.stringify(formatData), function (err) {
      if (err) throw err;
    });
  };

  return Trade;
})();

var data = {
  paths: _fixturesPaths2['default'],
  costs: _fixturesCosts2['default']
};

var trade = new Trade(data);
trade.exportGraph(_graphlib2['default'].json.write(trade.costGraph), trade.costMap);