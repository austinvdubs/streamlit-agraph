import React, { useRef, useEffect } from 'react';
import VisGraph, {GraphData, GraphEvents, Options} from 'react-vis-graph-wrapper';
import { Streamlit } from "streamlit-component-lib";
import { useRenderData } from "streamlit-component-lib-react-hooks";

function StreamlitVisGraph() {
  const renderData = useRenderData();
  const networkRef = useRef<any>(null);

  const graphIn = JSON.parse(renderData.args["data"])

  const options: Options = JSON.parse(renderData.args["config"])

  const lookupNodeId = (lookupNode, myNodes) => myNodes.find(node => node.id === lookupNode);

  const graph: GraphData = {nodes: graphIn.nodes.slice(), edges: graphIn.edges.slice()}

  // Center node functionality
  const centerNode = (options as any).center_node;

  const events: GraphEvents = {
    selectNode: (event) => {
      Streamlit.setComponentValue(event.nodes);
    }
    ,
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

  // Effect to center on node when the network is ready
  useEffect(() => {
    if (networkRef.current && centerNode) {
      const network = networkRef.current;
      
      console.log(`Attempting to center on node: ${centerNode}`);
      
      // Wait for stabilization to complete before centering
      const handleStabilized = () => {
        console.log('Network stabilized, focusing on node:', centerNode);
        try {
          // Focus on the specified node with animation and zoom
          network.focus(centerNode, {
            scale: 2.0, // Zoom in more to see the centered node clearly
            animation: {
              duration: 1500,
              easingFunction: 'easeInOutQuad',
            },
          });
        } catch (error) {
          console.warn(`Could not center on node ${centerNode}:`, error);
        }
      };

      // Multiple strategies to ensure centering works
      const attemptFocus = () => {
        if (network) {
          handleStabilized();
        }
      };

      // Listen for stabilization completion
      network.on('stabilizationIterationsDone', handleStabilized);
      
      // Also listen for when physics is disabled (for hierarchical layouts)
      network.on('afterDrawing', () => {
        if (!network.physics.enabled) {
          attemptFocus();
        }
      });
      
      // Try to center after a short delay to ensure network is ready
      const timeoutId = setTimeout(attemptFocus, 500);
      
      // Also try to center immediately if already stabilized
      if (network.physics.stabilized || !network.physics.enabled) {
        attemptFocus();
      }

      // Cleanup listeners and timeout
      return () => {
        network.off('stabilizationIterationsDone', handleStabilized);
        network.off('afterDrawing');
        clearTimeout(timeoutId);
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
          
          // If we have a center node and the network just loaded, attempt to focus
          if (centerNode && network) {
            console.log('Network loaded with center node:', centerNode);
            // Small delay to ensure network is fully initialized
            setTimeout(() => {
              try {
                network.focus(centerNode, {
                  scale: 2.0,
                  animation: {
                    duration: 1500,
                    easingFunction: 'easeInOutQuad',
                  },
                });
              } catch (error) {
                console.warn('Failed to focus on initial load:', error);
              }
            }, 1000);
          }
        }}
      />
    </span>
  )
}

export default StreamlitVisGraph;
