import Svg, { Path } from "react-native-svg";

// ================================
// Types
// ================================

const icons = {
  clear: (color: string) => <Path fill={color} d="M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20m-2.121 6.464a1 1 0 0 0-.084 1.415l.084.095L10.586 12l-2.707 2.707a1 1 0 0 0 1.414 1.414L12 13.414l2.707 2.707a1 1 0 0 0 1.414-1.414L13.414 12l2.707-2.707a1 1 0 0 0-1.414-1.414L12 10.586z" />,
}

type IconName = keyof typeof icons;

// ================================
// components
// ================================

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/**
 * Icon 컴포넌트
 * @param name icons 배열에 있는 사용하고 싶은 아이콘의 이름을 입력합니다.
 * @param size icon 크기를 설정합니다.
 * @param color icon 색상을 설정합니다.
 */
export function Icon({ name, size = 24, color = "#FFFFFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {icons[name](color)}
    </Svg>
  );
}