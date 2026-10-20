import { Row } from "../../layout";
import { Switch } from "../../ui/Switch";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props {
  label: string;
  value: boolean;
  onToggle: () => void;
}

/**
 * 알림 설정 한 줄 (이름 + 켜고 끄는 스위치)
 * @param label 알림 이름
 * @param value 켜져 있는지
 * @param onToggle 스위치를 눌렀을 때 호출
 */
export function NotificationRow({ label, value, onToggle }: Props) {
  return (
    <Row width="full" align="between" className="items-center">
      <Text variant="base-large" className="text-text-primary">{label}</Text>
      <Switch value={value} onToggle={onToggle} />
    </Row>
  );
}
