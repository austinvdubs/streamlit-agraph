import React, { useRef, useEffect } from 'react';
import VisGraph, {GraphData, GraphEvents, Options} from 'react-vis-graph-wrapper';
import { Streamlit } from "streamlit-component-lib";
import { useRenderData } from "streamlit-component-lib-react-hooks";

function StreamlitVisGraph() {
  const renderData = useRenderData();
  const networkRef = useRef<any>(null);
  const hasCenteredRef = useRef<boolean>(false);

  const graphIn = JSON.parse(renderData.args["data"])

  const baseOptions: Options = JSON.parse(renderData.args["config"])
  
  // Ensure interaction is enabled to allow panning after focus
  const options: Options = {
    ...baseOptions,
    interaction: {
      dragView: true,
      zoomView: true,
      dragNodes: true,
      hover: true,
      navigationButtons: false,
      keyboard: true,
      ...((baseOptions as any).interaction || {})
    }
  }

  const lookupNodeId = (lookupNode, myNodes) => myNodes.find(node => node.id === lookupNode);

  const graph: GraphData = {nodes: graphIn.nodes.slice(), edges: graphIn.edges.slice()}

  // Center node functionality - support both single node ID and {center_node, zoom} format
  const centerNodeConfig = (options as any).center_node;
  
  // Parse center node configuration
  let centerNode: string | null = null;
  let zoomScale: number = 2.0; // default zoom scale
  
  if (centerNodeConfig) {
    if (typeof centerNodeConfig === 'string' || typeof centerNodeConfig === 'number') {
      // Backward compatibility: single node ID
      centerNode = String(centerNodeConfig);
    } else if (typeof centerNodeConfig === 'object' && centerNodeConfig.center_node) {
      // New format: {center_node: id, zoom: scale}
      centerNode = String(centerNodeConfig.center_node);
      zoomScale = centerNodeConfig.zoom || 2.0;
    }
  }

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

  // Reset the centered flag when centerNode config changes
  useEffect(() => {
    hasCenteredRef.current = false;
  }, [centerNodeConfig]);

  // Effect to center on node when the network is ready
  useEffect(() => {
    if (networkRef.current && centerNode && !hasCenteredRef.current) {
      const network = networkRef.current;
      
      console.log(`Attempting to center on node: ${centerNode} with zoom scale: ${zoomScale}`);
      
      // Single function to focus on the node
      const focusOnNode = () => {
        if (hasCenteredRef.current) return; // Prevent multiple focus calls
        
        console.log('Focusing on node:', centerNode, 'with zoom:', zoomScale);
        try {
          // Get the position of the node we want to center on
          const nodePositions = network.getPositions([centerNode]);
          const nodePosition = nodePositions[centerNode];
          
          if (nodePosition) {

            network.focus(centerNode, {
              scale: zoomScale,
              animation: {
                duration: 1500,
                easingFunction: 'easeInOutQuad',
              },
              locked: false,
            });
            
            // Release the node after animation to ensure camera isn't locked
            setTimeout(() => {
              network.releaseNode();
            }, 1600);
          } else {
            console.warn(`Node position not found for: ${centerNode}`);
          }
          
          // Mark as centered to prevent further focus calls
          hasCenteredRef.current = true;
        } catch (error) {
          console.warn(`Could not center on node ${centerNode}:`, error);
        }
      };

      // Wait for stabilization before centering
      const handleStabilized = () => {
        focusOnNode();
      };

      // If physics is disabled or already stabilized, focus immediately
      if (!network.physics.enabled || network.physics.stabilized) {
        // Small delay to ensure network is fully ready
        setTimeout(focusOnNode, 100);
      } else {
        // Otherwise wait for stabilization
        network.once('stabilizationIterationsDone', handleStabilized);
      }

      // Cleanup listener
      return () => {
        network.off('stabilizationIterationsDone', handleStabilized);
      };
    }
  }, [centerNode]);

  return (
    <span>
      <VisGraph
        graph={graph}
        options={options}
        events={events}
        getNetwork={(network: any) => {
          console.log('Network instance received:', network);
          networkRef.current = network;
          // Focus will be handled in the useEffect hook, not here
        }}
      />
    </span>
  )
}

export default StreamlitVisGraph;
