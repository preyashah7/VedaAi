interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard';
}

const styles: Record<DifficultyBadgeProps['difficulty'], string> = {
  easy: 'bg-[#E8F5E9] text-[#2E7D32]',
  medium: 'bg-[#FFF8E1] text-[#F57F17]',
  hard: 'bg-[#FFEBEE] text-[#C62828]',
};

export const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps): JSX.Element => {
  return <span className={`rounded-full px-3 py-0.5 text-[11px] font-semibold ${styles[difficulty]}`}>{difficulty}</span>;
};
