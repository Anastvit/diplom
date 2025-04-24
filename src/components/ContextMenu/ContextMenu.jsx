import styles from './ContextMenu.module.css';

const ContextMenu = ({ x, y, id }) => {
  const changeType = type => window.dispatchEvent(
    new CustomEvent('edge-type-change', { detail: { id, type } })
  );
  const del = () => window.dispatchEvent(
    new CustomEvent('edge-delete', { detail: { id } })
  );

  return (
    <div className={styles.menu} style={{ top: y, left: x }}>
      <button onClick={() => changeType('single')}>Одиночная</button>
      <button onClick={() => changeType('multi')}>Множественная</button>
      <button className={styles.delete} onClick={del}>Удалить</button>
    </div>
  );
};

export default ContextMenu;
