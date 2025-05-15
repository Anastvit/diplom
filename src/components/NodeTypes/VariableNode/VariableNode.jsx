import React from 'react';
import { Handle, Position } from 'reactflow';
import styles from './VariableNode.module.css';

const VariableNode = ({ data, id }) => {
  const { custom = {}, onUpdate, onContext } = data;
  const { name = '', useRange = false, value = '', range = {} } = custom;

  const update = (patch) => {
    if (typeof onUpdate === 'function') {
      onUpdate(id, { ...custom, ...patch });
    }
  };

  return (
    <div className={styles.node} onContextMenu={(e) => onContext?.(e, id)}>
      <Handle type="target" position={Position.Left} className={styles.handle} />

      <div className={styles.group}>
        <label>Имя:</label>
        <input
          type="text"
          placeholder="myVar"
          value={name}
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>

      <div className={styles.group}>
        <label>
          <input
            type="checkbox"
            checked={useRange}
            onChange={(e) => update({ useRange: e.target.checked })}
          />
          Указать диапазон
        </label>
      </div>

      {!useRange && (
        <div className={styles.group}>
          <label>Значение:</label>
          <input
            type="number"
            value={value}
            onChange={(e) => update({ value: e.target.value })}
          />
        </div>
      )}

      {useRange && (
        <div className={styles.group}>
          <label>Диапазон:</label>
          <div className={styles.inline}>
            <input
              type="number"
              placeholder="min"
              value={range.min || ''}
              onChange={(e) =>
                update({ range: { ...range, min: e.target.value } })
              }
            />
            <input
              type="number"
              placeholder="max"
              value={range.max || ''}
              onChange={(e) =>
                update({ range: { ...range, max: e.target.value } })
              }
            />
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Right} className={styles.handle} />
    </div>
  );
};

export default VariableNode;
