import { BaseEdge, getBezierPath } from 'reactflow';
import styles from './EdgeItem.module.css';

const EdgeItem = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeType = data?.type || 'single';

  const stroke = edgeType === 'multi' ? '#007bff' : '#333';
  const strokeWidth = edgeType === 'multi' ? 3 : 2;
  const strokeDasharray = edgeType === 'multi' ? '5,5' : '0';

  const handleContextMenu = (e) => {
    e.preventDefault();
    const event = new CustomEvent('edge-context', {
      detail: { id, x: e.clientX, y: e.clientY },
    });
    window.dispatchEvent(event);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ stroke, strokeWidth, strokeDasharray }} />
      <path
        d={edgePath}
        className={styles.interactionPath}
        onContextMenu={handleContextMenu}
      />
    </>
  );
};

export default EdgeItem;
