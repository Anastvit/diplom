import React, { useState, useEffect } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import vfsFonts from 'pdfmake/build/vfs_fonts';
import styles from './Sidebar.module.css';

pdfMake.vfs = vfsFonts.vfs;

const Sidebar = ({ paths = [], nodes, edges, rootId, onLoadTemplate, onDownload }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const stored = Object.keys(JSON.parse(localStorage.getItem('templates') || '{}'));
    setTemplates(stored);
  }, []);

  const saveTemplate = () => {
    if (!templateName) return;
    const all = JSON.parse(localStorage.getItem('templates') || '{}');
    all[templateName] = { nodes, edges, rootId };
    localStorage.setItem('templates', JSON.stringify(all));
    setTemplates(Object.keys(all));
    setTemplateName('');
  };

  const loadTemplate = (name) => {
    const all = JSON.parse(localStorage.getItem('templates') || '{}');
    if (all[name]) {
      onLoadTemplate(all[name]);
    }
  };

  const deleteTemplate = (name) => {
    if (!window.confirm(`Удалить шаблон "${name}"?`)) return;
    const all = JSON.parse(localStorage.getItem('templates') || '{}');
    delete all[name];
    localStorage.setItem('templates', JSON.stringify(all));
    setTemplates(Object.keys(all));
  };

  const handleDownloadPDF = () => {
    const content = paths.map((p, i) => ({
      text: `${i + 1}. ${p}`,
      margin: [0, 5, 0, 5],
      fontSize: 12,
    }));

    const docDefinition = {
      content: [{ text: 'Сгенерированные задачи', style: 'header' }, ...content],
      styles: {
        header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
      },
      defaultStyle: { font: 'Roboto' },
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

  const handleGenerate = () => {
    window.dispatchEvent(new CustomEvent('generate'));
  };

  const handleClear = () => {
    window.dispatchEvent(new CustomEvent('clear-canvas'));
  };

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {!collapsed && (
        <>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Варианты</h4>
            <div className={styles.buttons}>
              <button className={styles.button} onClick={onDownload}>JSON</button>
              <button className={styles.button} onClick={handleDownloadPDF}>PDF</button>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Шаблоны</h4>
            <div className={styles.templateControls}>
              <input
                className={styles.input}
                type="text"
                placeholder="Имя шаблона"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <button className={styles.save} onClick={saveTemplate}>💾</button>
            </div>
            <div className={styles.templates}>
              {templates.map((t) => (
                <div key={t} className={styles.templateRow}>
                  <button className={styles.template} onClick={() => loadTemplate(t)}>{t}</button>
                  <button className={styles.delete} onClick={() => deleteTemplate(t)}>🗑</button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Результаты</h4>
            {paths.length === 0 ? (
              <p className={styles.empty}>Ничего не сгенерировано</p>
            ) : (
              <div className={styles.generated}>
                {paths.map((p, i) => (
                  <div key={i} className={styles.resultItem}>
                    <span className={styles.resultNumber}>{i + 1}.</span> {p}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button className={styles.generateButton} onClick={handleGenerate}>Сгенерировать</button>
            <button className={styles.clearButton} onClick={handleClear}>Очистить</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
