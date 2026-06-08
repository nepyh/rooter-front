import Svg, { Path } from "react-native-svg";

const icons = {
  clear: (color: string) => <Path fill={color} d="M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20m-2.121 6.464a1 1 0 0 0-.084 1.415l.084.095L10.586 12l-2.707 2.707a1 1 0 0 0 1.414 1.414L12 13.414l2.707 2.707a1 1 0 0 0 1.414-1.414L13.414 12l2.707-2.707a1 1 0 0 0-1.414-1.414L12 10.586z" />,
}

type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color = "#FFFFFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {icons[name](color)}
    </Svg>
  );
}