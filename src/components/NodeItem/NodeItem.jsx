import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import styles from './NodeItem.module.css';

const NodeItem = ({ data }) => {
  const [text, setText] = useState(data.label || '');

  return (
    <div className={styles.node}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555', zIndex: 10 }}
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={styles.textarea}
        placeholder="Введите текст..."
        rows={2}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555', zIndex: 10 }}
      />
    </div>
  );
};

export default NodeItem;
