#!/usr/bin/env python3
"""
Example demonstrating the center node functionality in streamlit-agraph.

This example shows how to:
1. Create a simple graph with multiple nodes
2. Configure the graph to center on a specific node
3. Use the ConfigBuilder to interactively select which node to center on
"""

import streamlit as st
from streamlit_agraph import agraph, Node, Edge, Config, ConfigBuilder

# Set page configuration
st.set_page_config(page_title="Center Node Example", layout="wide")
st.title("Streamlit Agraph - Center Node Example")

st.markdown("""
This example demonstrates the new center node functionality. You can:
- Use the sidebar to enable centering and select which node to focus on
- The graph will automatically center on the selected node with a smooth animation
""")

# Create a sample graph with multiple nodes
def create_sample_graph():
    """Create a sample graph with multiple connected nodes."""
    nodes = [
        Node(id="central", label="Central Node", color="#ff6b6b", size=30),
        Node(id="node1", label="Node 1", color="#4ecdc4", size=20),
        Node(id="node2", label="Node 2", color="#45b7d1", size=20),
        Node(id="node3", label="Node 3", color="#96ceb4", size=20),
        Node(id="node4", label="Node 4", color="#feca57", size=20),
        Node(id="node5", label="Node 5", color="#ff9ff3", size=20),
        Node(id="isolated", label="Isolated Node", color="#a55eea", size=25),
    ]
    
    edges = [
        Edge(source="central", target="node1", label="connected"),
        Edge(source="central", target="node2", label="connected"),
        Edge(source="central", target="node3", label="connected"),
        Edge(source="node1", target="node4", label="linked"),
        Edge(source="node2", target="node5", label="linked"),
        Edge(source="node4", target="node5", label="cross-link"),
        # isolated node has no connections
    ]
    
    return nodes, edges

# Create the graph
nodes, edges = create_sample_graph()

# Use ConfigBuilder for interactive configuration
config_builder = ConfigBuilder(nodes=nodes)
config = config_builder.build()

# Display some information about the current configuration
col1, col2 = st.columns(2)

with col1:
    st.subheader("Graph Information")
    st.write(f"Total nodes: {len(nodes)}")
    st.write(f"Total edges: {len(edges)}")
    
    if hasattr(config, 'center_node') and config.center_node:
        st.success(f"🎯 Graph will center on: **{config.center_node}**")
    else:
        st.info("No center node selected")

with col2:
    st.subheader("Instructions")
    st.write("1. Open the sidebar (←)")
    st.write("2. Expand 'Center Node Config'")
    st.write("3. Check 'enable_center'")
    st.write("4. Select a node to center on")
    st.write("5. Watch the graph focus!")

# Render the graph
st.subheader("Interactive Graph")
result = agraph(nodes=nodes, edges=edges, config=config)

# Display any interaction results
if result:
    st.write("Selected nodes:", result)

# Show example code
with st.expander("💻 Example Code"):
    st.code("""
# Basic usage with center node
from streamlit_agraph import agraph, Node, Edge, Config

# Create nodes and edges
nodes = [Node(id="center", label="Center"), Node(id="other", label="Other")]
edges = [Edge(source="center", target="other")]

# Create config with center node
config = Config(center_node="center")

# Render the graph
agraph(nodes=nodes, edges=edges, config=config)
""", language="python")

# Advanced configuration example
with st.expander("⚙️ Advanced Configuration"):
    st.code("""
# Using ConfigBuilder for interactive configuration
config_builder = ConfigBuilder(nodes=nodes)
config = config_builder.build()

# Manual configuration
config = Config(
    height=600,
    width=800,
    physics=True,
    center_node="your_node_id"  # Specify the node to center on
)
""", language="python")
