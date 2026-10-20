import { useEffect, useState } from "react";
import { Modal, View } from "react-native";
import { Row, Stack } from "../../layout";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props {
  visible: boolean;
  date: Date | null;
  initial?: { title: string; memo: string };
  submitLabel: string;
  onClose: () => void;
  onSubmit: (title: string, memo: string) => void;
}

/**
 * 개인 일정 제목·메모를 입력하는 아래쪽 모달 (추가·수정 겸용)
 * @param visible 모달을 띄울지
 * @param date 일정 날짜, null 이면 그리지 않음
 * @param initial 열릴 때 채워 둘 제목·메모 (수정할 때)
 * @param submitLabel 제목과 버튼에 붙일 글자 (예: 추가, 수정)
 * @param onClose 취소하거나 닫을 때 호출
 * @param onSubmit 버튼을 눌렀을 때 앞뒤 공백을 뺀 제목·메모로 호출
 */
export function EventFormModal({ visible, date, initial, submitLabel, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (visible) {
      setTitle(initial?.title ?? "");
      setMemo(initial?.memo ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!date) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-neutral-1000/50 justify-end">
        <Stack gap="l" className="bg-background-primary p-spacing-6 rounded-t-radius-4">
          <Text variant="header-medium">{`${date.getMonth() + 1}월 ${date.getDate()}일 일정 ${submitLabel}`}</Text>
          <Input label="제목" value={title} onChangeText={setTitle} />
          <Input label="메모" value={memo} onChangeText={setMemo} multiline style={{ height: 80, textAlignVertical: "top" }} />
          <Row gap="m" width="full">
            <View className="flex-1">
              <Button variant="disabled" disabled={false} onPress={onClose}> 취소 </Button>
            </View>
            <View className="flex-1">
              <Button variant={title.trim() ? "primary" : "disabled"} onPress={() => onSubmit(title.trim(), memo.trim())}> {submitLabel} </Button>
            </View>
          </Row>
        </Stack>
      </View>
    </Modal>
  );
}
