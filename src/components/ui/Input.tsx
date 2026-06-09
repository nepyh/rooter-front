import { useState, useRef } from "react";
import { View, TextInput, TextInputProps, Pressable} from "react-native";
import { Text } from "./Text";
import { Row, Stack } from "../layout";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props extends TextInputProps{
  label?: string;
  errorMessage?: string;
  className?: string;
}

/**
 * Input 컴포넌트
 * @param state Input 상태를 설정합니다.
 * @param label Input label을 추가합니다.
 */
export function Input({ label, errorMessage, className = "", onChangeText, value, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    onChangeText?.("");
    inputRef.current?.clear();
  };

  return (
    <Stack gap="s">
      <View className={`p-xl w-full gap-xxs rounded-md bg-neutral-700 ${focused ? "border-2 border-primary-500" : "p-xl border-2 border-transparent"} ${errorMessage && "border-2 border-utility-error-primary"}`}>
        {label &&
          <Text variant="base-caption" weight="medium" className="text-secondary">
            {label}
          </Text>
        }
        <Row gap="s">
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholderTextColor="#C9CDD6"
            className={`
              flex-1 text-lg text-white
              ${className}
            `}
            {...props}
          />
          {value && <Pressable onPress={handleClear}><Icon name="clear" size={22} color="#6B7280" /></Pressable>}
        </Row>
      </View>
      {errorMessage && <Text variant="base-small" className="text-utility-error-primary"> {errorMessage} </Text>}
    </Stack>
  );
}