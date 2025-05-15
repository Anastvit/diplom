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
import VariableNode from '@components/NodeTypes/VariableNode';
import ArrayNode from '@components/NodeTypes/ArrayNode';
import ContextMenu from '@components/ContextMenu';
import NodeContextMenu from '@components/NodeContextMenu';
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

  const [nodeContextMenu, setNodeContextMenu] = useState({
    x: 0,
    y: 0,
    nodeId: null,
  });

  const nodeTypes = useMemo(
    () => ({
      element: (props) => <NodeItem {...props} isRoot={props.id === rootNodeId} />,
      variable: VariableNode,
      array: ArrayNode,
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

    const data = JSON.parse(raw);
    const position = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };

    const newNode = {
      id: String(Date.now()),
      type: data.type,
      position,
      data: {
        ...data.data,
        onUpdate: (id, newCustom) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id
                ? { ...node, data: { ...node.data, custom: newCustom } }
                : node
            )
          );
        },
        onContext: (e, id) => {
          e.preventDefault();
          setNodeContextMenu({ x: e.clientX, y: e.clientY, nodeId: id });
        },
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, []);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleClearCanvas = () => {
    if (window.confirm('Очистить весь холст?')) {
      setNodes([]);
      setEdges([]);
      setRootNodeId(null);
      setPaths([]);
    }
  };

  const handleNodeAction = (action, nodeId) => {
    setNodeContextMenu({ x: 0, y: 0, nodeId: null });

    if (action === 'delete') {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    }

    if (action === 'makeRoot') {
      setRootNodeId(nodeId);
    }

    if (action === 'duplicate') {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        const newNode = {
          ...node,
          id: String(Date.now()),
          position: { x: node.position.x + 40, y: node.position.y + 40 },
          data: {
            ...node.data,
            onContext: (e, id) => {
              e.preventDefault();
              setNodeContextMenu({ x: e.clientX, y: e.clientY, nodeId: id });
            },
          },
        };
        setNodes((nds) => [...nds, newNode]);
      }
    }
  };

  useEffect(() => {
    const closeMenus = () => {
      setEdgeContextMenu({ visible: false, x: 0, y: 0, edgeId: null });
      setNodeContextMenu({ x: 0, y: 0, nodeId: null });
    };

    const handleEdgeContext = (e) => {
      const { id, x, y } = e.detail;
      setEdgeContextMenu({ visible: true, x, y, edgeId: id });
    };

    const handleEdgeTypeChange = (e) => {
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

    window.addEventListener('click', closeMenus);
    window.addEventListener('edge-context', handleEdgeContext);
    window.addEventListener('edge-type-change', handleEdgeTypeChange);
    window.addEventListener('edge-delete', handleEdgeDelete);

    return () => {
      window.removeEventListener('click', closeMenus);
      window.removeEventListener('edge-context', handleEdgeContext);
      window.removeEventListener('edge-type-change', handleEdgeTypeChange);
      window.removeEventListener('edge-delete', handleEdgeDelete);
    };
  }, []);

  return (
    <div className={styles.canvas} onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        key={nodes.length + edges.length}
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

      <button className={styles.clearButton} onClick={handleClearCanvas}>
        Очистить холст
      </button>

      <Sidebar
        paths={paths}
        nodes={nodes}
        edges={edges}
        rootId={rootNodeId}
        onLoadTemplate={({ nodes: loadedNodes, edges, rootId }) => {
          setNodes(
            loadedNodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                onContext: (e, id) => {
                  e.preventDefault();
                  setNodeContextMenu({ x: e.clientX, y: e.clientY, nodeId: id });
                },
              },
            }))
          );
          setEdges(edges);
          setRootNodeId(rootId);
          setPaths([]);
        }}
        onDownload={() => {
          const blob = new Blob([JSON.stringify(paths, null, 2)], {
            type: 'application/json',
          });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'задачи.json';
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

      <NodeContextMenu
        x={nodeContextMenu.x}
        y={nodeContextMenu.y}
        nodeId={nodeContextMenu.nodeId}
        onAction={handleNodeAction}
      />
    </div>
  );
};

export default Canvas;
