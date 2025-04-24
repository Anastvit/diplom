import pdfMake from 'pdfmake/build/pdfmake';
import vfsFonts from 'pdfmake/build/vfs_fonts';
import styles from './Sidebar.module.css';

pdfMake.vfs = vfsFonts.vfs;

const Sidebar = ({ paths = [], nodes, onDownload }) => {
  const renderPath = (path) => path.join(' ');

  const handleDownloadPDF = () => {
    const content = paths.map((p, i) => ({
      text: `${i + 1}. ${renderPath(p)}`,
      margin: [0, 5, 0, 5],
      fontSize: 12,
    }));

    const docDefinition = {
      content: [
        { text: 'Сгенерированные задачи', style: 'header' },
        ...content,
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10],
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
      fonts: {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf',
        },
      },
    };

    pdfMake.createPdf(docDefinition).download('задачи.pdf');
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(paths, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'задачи.json';
    link.click();
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h3>Варианты задачи</h3>
        <div className={styles.buttons}>
          <button className={styles.saveButton} onClick={handleDownloadJSON}>
            Сохранить JSON
          </button>
          <button className={styles.saveButton} onClick={handleDownloadPDF}>
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
