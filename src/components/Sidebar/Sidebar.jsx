import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import pdfMake from 'pdfmake/build/pdfmake';
import vfsFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = vfsFonts.vfs;

const Sidebar = ({ paths = [], nodes, edges, rootId, onLoadTemplate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/templates')
      .then((res) => res.json())
      .then((data) => setTemplates(data.reverse()));
  }, []);

  const saveTemplate = async () => {
    if (!templateName.trim() || !nodes.length) return;

    const nodeMap = {};
    const typeMap = { element: 1, variable: 2, array: 3 };

    const formattedNodes = nodes.map((n, index) => {
      const id = index + 1;
      nodeMap[n.id] = id;
      return {
        type_id: typeMap[n.type] || 1,
        label: n.data?.label || '',
        custom_json: JSON.stringify(n.data?.custom || {}),
        is_root: n.id === rootId
      };
    });

    const formattedEdges = edges.map((e) => ({
      prev_id: nodeMap[e.source],
      next_id: nodeMap[e.target],
      type_id: e.data?.type === 'multi' ? 2 : 1
    }));

    const payload = {
      name: templateName.trim(),
      nodes: formattedNodes,
      edges: formattedEdges
    };

    const res = await fetch('http://localhost:8000/template/full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const created = await res.json();
    setTemplates((prev) => [created, ...prev]);
    setTemplateName('');
  };

  const loadTemplate = async (t) => {
    const res = await fetch(`http://localhost:8000/template/${t.id}/full`);
    const data = await res.json();

    const typedNodes = data.nodes.map((n) => ({
      id: String(n.id),
      type: ['element', 'variable', 'array'][n.type_id - 1],
      position: { x: 0, y: 0 },
      data: {
        label: n.label,
        custom: JSON.parse(n.custom_json || '{}'),
        onContext: (e, id) => {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('node-context', { detail: { id, x: e.clientX, y: e.clientY } }));
        },
      }
    }));

    const typedEdges = data.edges.map((e) => ({
      id: `${e.prev_id}-${e.next_id}`,
      source: String(e.prev_id),
      target: String(e.next_id),
      data: { type: e.type_id === 2 ? 'multi' : 'single' }
    }));

    onLoadTemplate({
      nodes: typedNodes,
      edges: typedEdges,
      rootId: String(data.rootId)
    });
  };

  const deleteTemplate = async (id) => {
    const confirm = window.confirm('Удалить шаблон?');
    if (!confirm) return;

    await fetch(`http://localhost:8000/templates/${id}`, {
      method: 'DELETE',
    });

    setTemplates((prev) => prev.filter((t) => t.id !== id));
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
                <div key={t.id} className={styles.templateRow}>
                  <button className={styles.template} onClick={() => loadTemplate(t)}>{t.name}</button>
                  <button className={styles.delete} onClick={() => deleteTemplate(t.id)}>🗑</button>
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
