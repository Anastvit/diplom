import DraggableElement from '@components/DraggableElement';

const MenuPanel = () => {
  return (
    <div style={{ width: '200px', padding: '1rem', borderRight: '1px solid #ccc' }}>
      <h3>Элементы</h3>
      <DraggableElement type="element" label="Элемент" />
    </div>
  );
};

export default MenuPanel;
