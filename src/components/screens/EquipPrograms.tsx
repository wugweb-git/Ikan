import { EquipFlow } from '../EquipFlow';

interface EquipProgramsProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

export function EquipPrograms({ className, onNavigate }: EquipProgramsProps) {
  return <EquipFlow className={className} />;
}