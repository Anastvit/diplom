export function buildGraph(edges) {
  return edges.reduce((acc, { source, target, data }) => {
    const src = String(source);
    const tgt = String(target);
    const type = data?.type || 'single';

    acc[src] = acc[src] || [];
    acc[src].push({ to: tgt, type });
    return acc;
  }, {});
}

export function generateRandomizedVariant(nodes, edges, rootId) {
  const labelMap = nodes.reduce((acc, node) => {
    acc[String(node.id)] = node.data.label?.trim() || '';
    return acc;
  }, {});

  const graph = buildGraph(edges);
  const result = [];

  function dfs(currentId, path) {
    const children = graph[currentId] || [];

    if (children.length === 0) {
      result.push([...path]);
      return;
    }

    const multiEdges = children.filter((e) => e.type === 'multi');
    const singleEdges = children.filter((e) => e.type !== 'multi');

    if (multiEdges.length > 0) {
      const count = getRandomInt(1, multiEdges.length);
      const selected = shuffleArray(multiEdges).slice(0, count);
      const selectedTexts = selected.map((e) => labelMap[e.to]).filter(Boolean);

      path.push(selectedTexts.join(', '));

      dfs(selected[0].to, [...path]); // идём только по одному
    }

    if (singleEdges.length === 1) {
      const next = singleEdges[0];
      dfs(next.to, [...path, labelMap[next.to]]);
    }

    if (singleEdges.length > 1) {
      singleEdges.forEach((e) => {
        dfs(e.to, [...path, labelMap[e.to]]);
      });
    }
  }

  dfs(String(rootId), [labelMap[String(rootId)]]);
  return result;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
