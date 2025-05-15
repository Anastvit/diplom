import React, { useState, useEffect } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import vfsFonts from 'pdfmake/build/vfs_fonts';
import styles from './Sidebar.module.css';

pdfMake.vfs = vfsFonts.vfs;

const Sidebar = ({ paths = [], nodes, edges, rootId, onLoadTemplate, onDownload }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
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
    const confirmed = window.confirm(`Удалить шаблон "${name}"?`);
    if (!confirmed) return;
    const all = JSON.parse(localStorage.getItem('templates') || '{}');
    delete all[name];
    localStorage.setItem('templates', JSON.stringify(all));
    setTemplates(Object.keys(all));
  };

  const renderPath = (path) => path;


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
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <button className={styles.toggleCollapse} onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '⇥' : '⇤'}
      </button>

      {!collapsed && (
        <>
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
            <button
              className={styles.toggleTemplates}
              onClick={() => setShowTemplates((prev) => !prev)}
            >
              {showTemplates ? 'Скрыть шаблоны' : 'Показать шаблоны'}
            </button>
          </div>

          {showTemplates && (
            <div className={styles.templates}>
              <input
                className={styles.input}
                type="text"
                placeholder="Имя шаблона"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <button className={styles.saveButtonGreen} onClick={saveTemplate}>
                💾 Сохранить
              </button>
              <div className={styles.list}>
                {templates.map((t) => (
                  <div key={t} className={styles.templateRow}>
                    <button className={styles.template} onClick={() => loadTemplate(t)}>
                      {t}
                    </button>
                    <button className={styles.deleteButton} onClick={() => deleteTemplate(t)}>
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
        </>
      )}
    </div>
  );
};

export default Sidebar;
