import React, { useCallback, useState, useEffect, useMemo } from 'react';
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
import Sidebar from '@components/Sidebar';
import VariantGenerator from '@components/VariantGenerator';

import styles from './Canvas.module.css';

const Canvas = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [paths, setPaths] = useState([]);
  const [rootNodeId, setRootNodeId] = useState(null);
  const [edgeContextMenu, setEdgeContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    edgeId: null,
  });

  const nodeTypes = useMemo(
    () => ({
      element: (props) => <NodeItem {...props} isRoot={props.id === rootNodeId} />,
    }),
    [rootNodeId]
  );

  const edgeTypes = useMemo(() => ({ default: EdgeItem }), []);

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
        addEdge(
          {
            ...connection,
            source: String(connection.source),
            target: String(connection.target),
            data: { type: 'single' },
          },
          eds
        )
      ),
    []
  );

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const raw = event.dataTransfer.getData('application/reactflow');
    if (!raw) return;
    try {
      JSON.parse(raw);
    } catch {
      return;
    }

    const position = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };

    const newNode = {
      id: String(Date.now()), // ← обязательно строка
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
    const handleEdgeContext = (e) => {
      const { id, x, y } = e.detail;
      setEdgeContextMenu({ visible: true, x, y, edgeId: id });
    };

    const handleTypeChange = (e) => {
      const { id, type } = e.detail;
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === id ? { ...edge, data: { ...edge.data, type } } : edge
        )
      );
      setEdgeContextMenu({ visible: false, x: 0, y: 0, edgeId: null });
    };

    const handleEdgeDelete = (e) => {
      const { id } = e.detail;
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
      setEdgeContextMenu({ visible: false, x: 0, y: 0, edgeId: null });
    };

    const handleMakeRoot = (e) => {
      const { id } = e.detail;
      setRootNodeId(String(id));
    };

    const handleClose = () => {
      setEdgeContextMenu({ visible: false, x: 0, y: 0, edgeId: null });
    };

    window.addEventListener('edge-context', handleEdgeContext);
    window.addEventListener('edge-type-change', handleTypeChange);
    window.addEventListener('edge-delete', handleEdgeDelete);
    window.addEventListener('make-root', handleMakeRoot);
    window.addEventListener('click', handleClose);

    return () => {
      window.removeEventListener('edge-context', handleEdgeContext);
      window.removeEventListener('edge-type-change', handleTypeChange);
      window.removeEventListener('edge-delete', handleEdgeDelete);
      window.removeEventListener('make-root', handleMakeRoot);
      window.removeEventListener('click', handleClose);
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

      <VariantGenerator
        nodes={nodes}
        edges={edges}
        rootId={rootNodeId || nodes[0]?.id}
        onGenerate={setPaths}
      />

      <Sidebar
        paths={paths}
        nodes={nodes}
        onDownload={() => {
          const json = paths.map((path) =>
            path.map((id) => nodes.find((n) => String(n.id) === String(id))?.data.label || '')
          );
          const blob = new Blob([JSON.stringify(json, null, 2)], {
            type: 'application/json',
          });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'paths.json';
          link.click();
        }}
      />

      {edgeContextMenu.visible && (
        <ContextMenu
          x={edgeContextMenu.x}
          y={edgeContextMenu.y}
          id={edgeContextMenu.edgeId}
        />
      )}
    </div>
  );
};

export default Canvas;
