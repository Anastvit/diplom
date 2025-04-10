import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeItem from '@components/NodeItem';
import EdgeItem from '@components/EdgeItem';
import ContextMenu from '@components/ContextMenu';
import styles from './Canvas.module.css';

const nodeTypes = {
  element: NodeItem,
};

const edgeTypes = {
  default: EdgeItem,
};

const Canvas = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [edgeContextMenu, setEdgeContextMenu] = useState({ visible: false, x: 0, y: 0, edgeId: null });

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge({ ...connection, data: { type: 'single' } }, eds)
      ),
    []
  );

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode = {
      id: `${+new Date()}`,
      type: 'element',
      position,
      data: { label: '' },
    };

    setNodes((nds) => nds.concat(newNode));
  }, []);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  useEffect(() => {
    const contextHandler = (e) => {
      const { id, x, y } = e.detail;
      setEdgeContextMenu({ visible: true, x, y, edgeId: id });
    };

    const close = () => setEdgeContextMenu({ visible: false, x: 0, y: 0, edgeId: null });

    const typeChangeHandler = (e) => {
      const { id, type } = e.detail;
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === id ? { ...edge, data: { ...edge.data, type } } : edge
        )
      );
      close();
    };

    const deleteHandler = (e) => {
      const { id } = e.detail;
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
      close();
    };

    window.addEventListener('edge-context', contextHandler);
    window.addEventListener('edge-type-change', typeChangeHandler);
    window.addEventListener('edge-delete', deleteHandler);
    window.addEventListener('click', close);

    return () => {
      window.removeEventListener('edge-context', contextHandler);
      window.removeEventListener('edge-type-change', typeChangeHandler);
      window.removeEventListener('edge-delete', deleteHandler);
      window.removeEventListener('click', close);
    };
  }, []);

  return (
    <div className={styles.canvas} onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {edgeContextMenu.visible && (
        <ContextMenu x={edgeContextMenu.x} y={edgeContextMenu.y} id={edgeContextMenu.edgeId} />
      )}
    </div>
  );
};

export default Canvas;
