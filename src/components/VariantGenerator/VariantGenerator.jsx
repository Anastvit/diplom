import React from 'react';
import { generateCombinatorialVariants } from '../../utils/variantGenerator';
import styles from './VariantGenerator.module.css';

const VariantGenerator = ({ nodes, edges, rootId, onGenerate }) => {
  const handleClick = () => {
    if (!rootId) return;
    const variants = generateCombinatorialVariants(nodes, edges, rootId);
    onGenerate(variants);
  };

  return (
    <button className={styles.button} onClick={handleClick}>
      Сгенерировать
    </button>
  );
};

export default VariantGenerator;
