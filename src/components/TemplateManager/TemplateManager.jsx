import React, { useState, useEffect } from 'react';
import styles from './TemplateManager.module.css';

const TemplateManager = ({ nodes, edges, rootId, onLoadTemplate }) => {
  const [name, setName] = useState('');
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const stored = Object.keys(JSON.parse(localStorage.getItem('templates') || '{}'));
    setTemplates(stored);
  }, []);

  const saveTemplate = () => {
    if (!name) return;
    const all = JSON.parse(localStorage.getItem('templates') || '{}');
    all[name] = { nodes, edges, rootId };
    localStorage.setItem('templates', JSON.stringify(all));
    setTemplates(Object.keys(all));
    setName('');
  };

  const loadTemplate = (templateName) => {
    const all = JSON.parse(localStorage.getItem('templates') || '{}');
    if (all[templateName]) {
      onLoadTemplate(all[templateName]);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h4>📁 Шаблоны</h4>
      <div className={styles.row}>
        <input
          className={styles.input}
          type="text"
          placeholder="Имя шаблона"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className={styles.button} onClick={saveTemplate}>
          💾 Сохранить
        </button>
      </div>
      <div className={styles.list}>
        {templates.map((t) => (
          <button key={t} className={styles.template} onClick={() => loadTemplate(t)}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateManager;
