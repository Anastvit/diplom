import React from 'react';
import styles from './VariantGenerator.module.css';

const VariantGenerator = ({ nodes, edges, rootId, onGenerate }) => {
  const generateVariants = () => {
    if (!rootId) return;

    const results = [];

    const visit = (currentId, path, skipText = false) => {
      const currentNode = nodes.find((n) => n.id === currentId);
      if (!currentNode) return;

      const outgoing = edges.filter((e) => e.source === currentId);
      const singleEdges = outgoing.filter((e) => e.data?.type !== 'multi');
      const multiEdges = outgoing.filter((e) => e.data?.type === 'multi');

      const basePath = [...path];
      if (!skipText) {
        const currentText = renderNodeText(currentId);
        if (currentText) basePath.push(currentText);
      }

      if (multiEdges.length > 0) {
        const multiTargets = multiEdges.map((e) => e.target);
        const combinations = generateSubsets(multiTargets);

        for (const combo of combinations) {
          const multiTexts = combo
            .map((id) => renderNodeText(id))
            .filter(Boolean);

          const newPath = [...basePath, multiTexts.join(', ')];

          const hasFurther =
            combo.some((id) => edges.some((e) => e.source === id)) ||
            singleEdges.length > 0;

          if (!hasFurther) {
            results.push(newPath.join(' '));
          } else {
            for (const id of combo) {
              const hasOutgoing = edges.some((e) => e.source === id);
              if (hasOutgoing) {
                visit(id, newPath, true); // 🔥 skip text!
              }
            }

            for (const edge of singleEdges) {
              visit(edge.target, newPath);
            }
          }
        }

        return;
      }

      if (singleEdges.length === 0) {
        results.push(basePath.join(' '));
        return;
      }

      for (const edge of singleEdges) {
        visit(edge.target, basePath);
      }
    };

    const generateSubsets = (arr) => {
      const result = [];
      const n = arr.length;
      for (let i = 1; i < 1 << n; i++) {
        const subset = [];
        for (let j = 0; j < n; j++) {
          if (i & (1 << j)) {
            subset.push(arr[j]);
          }
        }
        result.push(subset);
      }
      return result;
    };

    const renderNodeText = (nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return '';
      const { type, data } = node;
      const custom = data?.custom || {};

      if (type === 'element') {
        return data.label || '';
      }

      if (type === 'variable') {
        const { name, useRange, value, range } = custom;
        const val = useRange
          ? randomBetween(range.min, range.max)
          : value;
        return `${name} = ${val}`;
      }

      if (type === 'array') {
        const { name, length, mode, values, range } = custom;
        let content = '';

        if (mode === 'manual') {
          content = values?.join(', ') || '';
        } else if (mode === 'range') {
          content = randomArray(length, range.min, range.max).join(', ');
        }

        return `${name} = [${content}]`;
      }

      return '';
    };

    const randomBetween = (min, max) => {
      const a = Number(min);
      const b = Number(max);
      return Math.floor(Math.random() * (b - a + 1)) + a;
    };

    const randomArray = (len, min, max) => {
      const length = Number(len);
      const a = Number(min);
      const b = Number(max);
      return Array.from({ length }, () => randomBetween(a, b));
    };

    visit(rootId, []);
    onGenerate(results);
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.button} onClick={generateVariants}>
        Сгенерировать
      </button>
    </div>
  );
};

export default VariantGenerator;
