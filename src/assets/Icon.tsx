import Svg, { Path } from "react-native-svg";

// ================================
// Types
// ================================

const icons = {
  chevronLeft: (color: string) => <Path fill={color} d="M8.293 12.707a1 1 0 0 1 0-1.414l5.657-5.657a1 1 0 1 1 1.414 1.414L10.414 12l4.95 4.95a1 1 0 0 1-1.414 1.414z" />,
  clear: (color: string) => <Path fill={color} d="M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20M9.879 8.464a1 1 0 0 0-1.498 1.32l.084.095L10.586 12l-2.12 2.121a1 1 0 0 0 1.32 1.498l.094-.083L12 13.414l2.121 2.122a1 1 0 0 0 1.498-1.32l-.083-.095L13.414 12l2.122-2.121a1 1 0 0 0-1.32-1.498l-.095.083L12 10.586z" />,
  mail: (color: string) => <Path fill={color} d="m2.068 5.482l8.875 8.876a1.5 1.5 0 0 0 2.008.103l.114-.103l8.869-8.87q.043.165.058.337L22 6v12a2 2 0 0 1-1.85 1.995L20 20H4a2 2 0 0 1-1.995-1.85L2 18V6q0-.18.03-.35zM20 4q.182 0 .355.031l.17.039l-8.52 8.52l-8.523-8.522q.166-.045.34-.06L4 4z" />,
}

export type IconName = keyof typeof icons;

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