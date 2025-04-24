import jsPDF from 'jspdf';
import styles from './Sidebar.module.css';

const Sidebar = ({ paths, nodes, onDownload }) => {
  const renderPath = (path) => path.join(' ');

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Helvetica');
    doc.setFontSize(14);
    doc.text('Сгенерированные задачи', 10, 10);
    doc.setFontSize(12);

    let y = 20;

    paths.forEach((path, index) => {
      const text = `${index + 1}. ${renderPath(path)}`;
      const lines = doc.splitTextToSize(text, 180);

      if (y + lines.length * 8 >= 280) {
        doc.addPage();
        y = 20;
      }

      doc.text(lines, 10, y);
      y += lines.length * 8 + 4;
    });

    doc.save('задачи.pdf');
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h3>Варианты задачи</h3>
        <div className={styles.buttons}>
          <button onClick={onDownload} className={styles.saveButton}>
            Сохранить JSON
          </button>
          <button onClick={handleDownloadPDF} className={styles.saveButton}>
            Сохранить PDF
          </button>
        </div>
      </div>
      <div className={styles.list}>
        {paths.length === 0 ? (
          <p className={styles.empty}>Ничего не найдено</p>
        ) : (
          paths.map((p, i) => (
            <div key={i} className={styles.item}>
              <strong>{i + 1}.</strong> {renderPath(p)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
