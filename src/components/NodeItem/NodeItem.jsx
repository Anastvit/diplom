import { useState, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals, useReactFlow } from 'reactflow';
import styles from './NodeItem.module.css';

const NodeItem = ({ id, data, isRoot }) => {
  const [text, setText] = useState(data.label || '');
  const { setNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label: text } } : n
      )
    );
    updateNodeInternals(id);
  }, [text, id, setNodes, updateNodeInternals]);

  return (
    <div
      className={`${styles.node} ${isRoot ? styles.root : ''}`}
      onContextMenu={(e) => data?.onContext?.(e, id)}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', zIndex: 10 }}
      />

      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите текст..."
        rows={2}
      />

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', zIndex: 10 }}
      />
    </div>
  );
};

export default NodeItem;
