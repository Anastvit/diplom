import React, { forwardRef, useImperativeHandle } from 'react';

const VariantGenerator = forwardRef(({ nodes, edges, rootId, onGenerate }, ref) => {
  const generateVariants = () => {
    if (!rootId) return;

    const results = [];
    const seenPaths = new Set();

    const visit = (path, nodePath) => {
      const currentId = nodePath[nodePath.length - 1];
      const currentNode = nodes.find(n => n.id === currentId);
      if (!currentNode) return;

      const outgoing = edges.filter(e => e.source === currentId);
      const singleEdges = outgoing.filter(e => e.data?.type !== 'multi');
      const multiEdges = outgoing.filter(e => e.data?.type === 'multi');

      if (multiEdges.length > 0) {
        const targets = multiEdges.map(e => e.target);
        const subsets = generateSubsets(targets);

        for (const subset of subsets) {
          const multiTexts = subset.map(renderNodeText).filter(Boolean).join(', ');
          const newPath = [...path, multiTexts];
          const newNodePath = [...nodePath, ...subset];
          visit(newPath, newNodePath);
        }
      }

      if (singleEdges.length === 0 && multiEdges.length === 0) {
        const key = nodePath.join('→');
        if (!seenPaths.has(key)) {
          seenPaths.add(key);
          results.push(path.join(' '));
        }
        return;
      }

      for (const edge of singleEdges) {
        const nextId = edge.target;
        const nextText = renderNodeText(nextId);
        visit([...path, nextText], [...nodePath, nextId]);
      }
    };

    const generateSubsets = arr => {
      const result = [];
      const n = arr.length;
      for (let i = 1; i < 1 << n; i++) {
        const subset = [];
        for (let j = 0; j < n; j++) {
          if (i & (1 << j)) subset.push(arr[j]);
        }
        result.push(subset);
      }
      return result;
    };

    const renderNodeText = nodeId => {
      const node = nodes.find(n => n.id === nodeId);
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

    const rootText = renderNodeText(rootId);
    visit([rootText], [rootId]);
    onGenerate(results);
  };

  useImperativeHandle(ref, () => generateVariants);

  return null;
});

export default VariantGenerator;
