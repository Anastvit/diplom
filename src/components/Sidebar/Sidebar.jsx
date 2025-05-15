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

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.collapseButton} onClick={() => setCollapsed(!collapsed)}>
        <svg
          className={collapsed ? styles.iconFlipped : styles.icon}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="14"
          height="14"
        >
          <path fill="currentColor" d="M15 6l-6 6 6 6" />
        </svg>
      </div>

      {!collapsed && (
        <>
          <div className={styles.section}>
            <h3 className={styles.heading}>Варианты</h3>
            <div className={styles.buttons}>
              <button className={styles.button} onClick={onDownload}>💾 JSON</button>
              <button className={styles.button} onClick={handleDownloadPDF}>📄 PDF</button>
            </div>
          </div>

          <div className={styles.templatePanel}>
            <h3 className={styles.heading}>📁 Шаблоны</h3>
            <div className={styles.templateControls}>
              <input
                className={styles.input}
                type="text"
                placeholder="Имя шаблона"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <button className={styles.templateSave} onClick={saveTemplate}>
                💾 Сохранить
              </button>
            </div>

            <div className={styles.list}>
              {templates.map((t) => (
                <div key={t} className={styles.templateRow}>
                  <button className={styles.template} onClick={() => loadTemplate(t)}>
                    {t}
                  </button>
                  <button className={styles.delete} onClick={() => deleteTemplate(t)}>
                    🗑
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            {paths.length === 0 ? (
              <p className={styles.empty}>Нет сгенерированных задач</p>
            ) : (
              <div className={styles.generated}>
                {paths.map((p, i) => (
                  <div key={i} className={styles.pathItem}>
                    <strong>{i + 1}.</strong> {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
