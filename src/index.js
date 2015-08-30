import _ from 'lodash';
import appRoot from 'app-root-path';
import fs from 'fs';
import graphlib from 'graphlib';
import paths from './fixtures/paths';
import costs from './fixtures/costs';

class Trade {

  constructor(data) {
    this.data = _.assign({
      costs,
      paths
    });

    this.costGraph = {};
    this.costMap = {};
    this.pathGraph = {};
    this.pathMap = {};
    this.buildGraphs(data);
  }

  buildGraphs() {
    const options = { directed: false, compound: false, multigraph: false };
    this.pathGraph = new graphlib.Graph(options);
    this.costGraph = new graphlib.Graph(options);

    data.paths.forEach((edge) => {
      this.pathGraph.setEdge(edge.from, edge.to);
    });

    data.costs.forEach((edge) => {
      this.costGraph.setEdge(edge.from, edge.to, Number(edge.value));
    });

    this.costMap = graphlib.alg.floydWarshall(
      this.costGraph,
      (e) => this.costGraph.edge(e),
      (e) => this.costGraph.nodeEdges(e)
    );

    this.pathMap = graphlib.alg.floydWarshall(
      this.pathGraph,
      (e) => 1,
      (e) => this.pathGraph.nodeEdges(e)
    );
  }

  getPath(from, to) {
    const subMap = this.pathMap[from];
    const path = [];

    path.push(to);
    return buildPath(this.subMap, path, from, to); //Build path recursively
  }

  getCost(from, to) {
    return this.costMap[from][to].distance;
  }

  exportGraph(graph, map) {
    let formatData = {
      nodes: [],
      links: [],
      map
    };

    let nodes = graph.nodes;
    let links = graph.edges;

    _.forEach(nodes, (row, key) => {
      formatData.nodes.push({
        name: row.v,
        group: key
      });
    });

    _.forEach(links, (row) => {
      formatData.links.push({
        source: _.find(formatData.nodes, { name:row.v }).group,
        target: _.find(formatData.nodes, { name:row.w }).group,
        value:row.value
      });
    });

    fs.writeFile(appRoot + '/d3/graph.json', JSON.stringify(formatData), function (err) {
      if (err) throw err;
    });
  }
}

const data = {
  paths,
  costs
};

const trade = new Trade(data);
trade.exportGraph(graphlib.json.write(trade.costGraph), trade.costMap);


