import { useState } from "react";
import { View, TextInput, TextInputProps } from "react-native";
// import tailwindConfig from "@/tailwind.config";
import { Text } from "./Text";

// ================================
// Types
// ================================

type State = "default" | "focused";

// ================================
// Styles
// ================================

const stateStyles: Record<State, string> = {
  "default": "bg-neutral-700",
  "focused": "border-2 border-primary-500 bg-neutral-700",
};

// ================================
// Components
// ================================

interface Props extends TextInputProps{
  state?: State;
  label?: string;
  className?: string;
}

/**
 * Input 컴포넌트
 * @param state Input 상태를 설정합니다.
 * @param label Input label을 추가합니다.
 */
// export function Input({ state = "default", label, className = "", ...props }: Props) {
//   const [focused, setFocused] = useState(false);

//   return (
//     <View>
//       {label &&
//         <Text variant="base-caption" weight="medium" className="text-secondary">
//           {label}
//         </Text>
//       }
//       <TextInput
//         className={`
//           ${className}
//         `}
//         placeholderTextColor=
//         {...props}
//       >

//       </TextInput>
//     </View>
//   );
// }