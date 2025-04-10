import styles from './ContextMenu.module.css';

const ContextMenu = ({ x, y, id }) => {
  const handleChangeType = (type) => {
    window.dispatchEvent(
      new CustomEvent('edge-type-change', {
        detail: { id, type },
      })
    );
  };

  const handleDelete = () => {
    window.dispatchEvent(
      new CustomEvent('edge-delete', {
        detail: { id },
      })
    );
  };

  return (
    <div
      className={styles.menu}
      style={{
        top: y,
        left: x,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={() => handleChangeType('single')}>Одиночная</button>
      <button onClick={() => handleChangeType('multi')}>Множественная</button>
      <button className={styles.delete} onClick={handleDelete}>Удалить</button>
    </div>
  );
};

export default ContextMenu;
