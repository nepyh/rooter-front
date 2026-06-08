import { useState, useRef } from "react";
import { View, TextInput, TextInputProps, Pressable} from "react-native";
import { Text } from "@/components";
import { Row } from "@/components";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props extends TextInputProps{
  label?: string;
  className?: string;
}

/**
 * Input 컴포넌트
 * @param state Input 상태를 설정합니다.
 * @param label Input label을 추가합니다.
 */
export function Input({ label, className = "", onChangeText, ...props }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    setValue("");
    inputRef.current?.clear();
  };

  return (
    <View className={`p-xl w-full gap-xxs rounded-md bg-neutral-700 ${focused ? "border-2 border-primary-500" : "p-xl border-2 border-transparent"}`}>
      {label &&
        <Text variant="base-caption" weight="medium" className="text-secondary">
          {label}
        </Text>
      }
      <Row gap="xs">
        <TextInput
          ref={inputRef}
          className={`
            flex-1 text-lg text-white
            ${className}
          `}
          placeholderTextColor="#C9CDD6"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          value={value}
          onChangeText={(text: string) => {setValue(text);} }
          {...props}
        />
        {value && <Pressable onPress={handleClear}> <Icon name="clear" size={22} color="#6B7280" /> </Pressable>}
      </Row>
    </View>
  );
}