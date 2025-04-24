import { BaseEdge, getBezierPath } from 'reactflow';
import styles from './EdgeItem.module.css';

const EdgeItem = ({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, markerEnd
}) => {
  const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const edgeType = data?.type || 'single';
  const style = {
    stroke: edgeType === 'multi' ? '#007bff' : '#333',
    strokeWidth: edgeType === 'multi' ? 3 : 2,
    strokeDasharray: edgeType === 'multi' ? '5,5' : '0',
  };
  const onCtx = e => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('edge-context', {
      detail: { id, x: e.clientX, y: e.clientY },
    }));
  };

  return <>
    <BaseEdge path={path} markerEnd={markerEnd} style={style} />
    <path d={path}
      className={styles.interactionPath}
      onContextMenu={onCtx}
    />
  </>;
};

export default EdgeItem;
