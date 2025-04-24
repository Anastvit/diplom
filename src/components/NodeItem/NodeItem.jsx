import { useState, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals, useReactFlow } from 'reactflow';
import styles from './NodeItem.module.css';

const NodeItem = ({ id, data, isRoot }) => {
  const [text, setText] = useState(data.label || '');
  const { setNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setNodes(nodes =>
      nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, label: text } } : n
      )
    );
    updateNodeInternals(id);
  }, [text, id, setNodes, updateNodeInternals]);

  const onContextMenu = e => {
    e.preventDefault();
    setShowMenu(true);
  };
  const handleSetRoot = () => {
    window.dispatchEvent(new CustomEvent('make-root', { detail: { id } }));
    setShowMenu(false);
  };

  useEffect(() => {
    const close = () => setShowMenu(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  return (
    <div
      className={`${styles.node} ${isRoot ? styles.root : ''}`}
      onContextMenu={onContextMenu}
    >
      {/* Входящая точка слева */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', zIndex: 10 }}
      />

      <textarea
        className={styles.textarea}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Введите текст..."
        rows={2}
      />

      {/* Исходящая точка справа */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', zIndex: 10 }}
      />

      {showMenu && (
        <div className={styles.menu}>
          <button onClick={handleSetRoot}>Сделать корневым</button>
        </div>
      )}
    </div>
  );
};

export default NodeItem;
