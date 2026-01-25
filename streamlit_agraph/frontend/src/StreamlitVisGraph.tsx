import React from 'react';
import VisGraph, {GraphData, GraphEvents, Options} from 'react-vis-graph-wrapper';
import { Streamlit } from "streamlit-component-lib";
import { useRenderData } from "streamlit-component-lib-react-hooks";

function StreamlitVisGraph() {
  const renderData = useRenderData();

  const graphIn = JSON.parse(renderData.args["data"])

  const options: Options = JSON.parse(renderData.args["config"])

  const lookupNodeId = (lookupNode, myNodes) => myNodes.find(node => node.id === lookupNode);

  const graph: GraphData = {nodes: graphIn.nodes.slice(), edges: graphIn.edges.slice()}

  const events: GraphEvents = {
    selectNode: (event) => {
      // Always prioritize node selection when a node is selected, 
      // regardless of whether edges are also selected
      if (event.nodes.length > 0) {
        Streamlit.setComponentValue(event.nodes[0]);
      }
    },
    selectEdge: (event) => {
      // Only handle edge selection when no nodes are selected
      if (event.edges.length > 0 && event.nodes.length === 0) {
        Streamlit.setComponentValue(event.edges[0]);
      }
    },
    doubleClick: (event) => {
      const lookupNode = lookupNodeId(event.nodes[0], graph.nodes);
      if (lookupNode && lookupNode.link) {
        const link = lookupNode.link;
        if (link) {
          window.open(link);
        }
      }
    }
  };

  return (
    <span>
      <VisGraph
        graph={graph}
        options={options}
        events={events}
        ref = {(network: any) => {
          // console.log(network)
        }}
      />
    </span>
  )
}

export default StreamlitVisGraph;
