import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { View, TextInput, TextInputProps, Pressable, Platform } from "react-native";
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
export const Input = forwardRef<TextInput, Props>(
  ({ label, errorMessage, className = "", onChangeText, value, secureTextEntry, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<TextInput>(null);
    // 다시 포커스한 뒤 첫 입력인지, iOS 비밀번호 칸은 이때 기존 글자를 전부 지움
    const refocusedRef = useRef(false);

    useImperativeHandle(ref, () => inputRef.current as TextInput);

    // iOS 비밀번호 칸이 지운 기존 글자를 되살려 이어서 입력, 전부 지우기는 X 버튼으로
    const handleChangeText = (text: string) => {
      const prev = value ?? "";
      const wasRefocused = refocusedRef.current;
      refocusedRef.current = false;
      const isSecure = secureTextEntry && !showPassword;
      if (Platform.OS === "ios" && isSecure && wasRefocused && prev.length > 0 && text.length <= 1) {
        onChangeText?.(text === "" ? prev.slice(0, -1) : prev + text);
        return;
      }
      onChangeText?.(text);
    };

    const handleClear = () => {
      onChangeText?.("");
      inputRef.current?.clear();
    };

    return (
      <Stack gap="s">
        <View className={`p-xl w-full gap-xxs rounded-md bg-neutral-700 ${focused ? "border-2 border-primary-500" : "p-xl border-2 border-transparent"} ${errorMessage && "border-2 border-utility-error-primary"}`}>
          {label && (
            <Text variant="base-caption" weight="medium" color="secondary">
              {label}
            </Text>
          )}
          <Row gap="s">
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={handleChangeText}
              onFocus={() => {
                refocusedRef.current = true;
                setFocused(true);
              }}
              onBlur={() => setFocused(false)}
              placeholderTextColor="#C9CDD6"
              secureTextEntry={secureTextEntry && !showPassword}
              className={`
                flex-1 text-lg text-white
                ${className}
              `}
              {...props}
            />
            {secureTextEntry && (
              <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                <Icon name={showPassword ? "eyeOff" : "eye"} size={22} color="#6B7280" />
              </Pressable>
            )}
            {!!value && (
              <Pressable onPress={handleClear}>
                <Icon name="clear" size={22} color="#6B7280" />
              </Pressable>
            )}
          </Row>
        </View>
        {errorMessage && (
          <Text variant="base-small" style={{ color: "#FF4D4F" }}> {errorMessage} </Text>
        )}
      </Stack>
    );
  }
);