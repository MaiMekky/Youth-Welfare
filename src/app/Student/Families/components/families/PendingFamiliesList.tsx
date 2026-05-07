/**
 * Pending Families List Component
 * Displays a list of pending family requests
 */
import React from 'react';
import { PendingFamilyCard } from './PendingFamilyCard';
import type { ProgramFamily } from '../../types';
import styles from '../../styles/components/PendingFamiliesList.module.css';

interface PendingFamiliesListProps {
  families: ProgramFamily[];
}

export const PendingFamiliesList: React.FC<PendingFamiliesListProps> = ({
  families,
}) => {
  return (
    <div className={styles.list}>
      {families.map((family) => (
        <PendingFamilyCard key={family.id} family={family} />
      ))}
    </div>
  );
};
