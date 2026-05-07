/**
 * Families Grid Component
 * Displays a grid of accepted families
 */
import React from 'react';
import { AcceptedFamilyCard } from './AcceptedFamilyCard';
import type { ProgramFamily } from '../../types';
import styles from '../../styles/components/FamiliesGrid.module.css';

interface FamiliesGridProps {
  families: ProgramFamily[];
  onViewDetails: (family: ProgramFamily) => void;
}

export const FamiliesGrid: React.FC<FamiliesGridProps> = ({
  families,
  onViewDetails,
}) => {
  return (
    <div className={styles.grid}>
      {families.map((family) => (
        <AcceptedFamilyCard
          key={family.id}
          family={family}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
