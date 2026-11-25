import { useState } from "react";
import { Keyboard, View } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { DatePill } from "../common/DatePill";
import { CalendarGrid } from "../common/CalendarGrid";
import { formatMonthDay } from "@/utils/home/planBoard";
import { getSpacing } from "@/utils/common/token";

// ================================
// Types
// ================================

type PickerTarget = "start" | "end";

// ================================
// Components
// ================================

interface RowProps {
  label: string;
  value: Date;
  minDate?: Date;
  maxDate?: Date;
  active: boolean;
  disabled: boolean;
  onToggle: () => void;
  onSelect: (date: Date) => void;
  className?: string;
}

function PeriodRow({ label, value, minDate, maxDate, active, disabled, onToggle, onSelect, className = "" }: RowProps) {
  return (
    <View className={`w-full bg-neutral-700 px-spacing-6 py-spacing-5 ${className}`} style={{ gap: getSpacing("spacing-7") }}>
      <Row width="full" align="between" className="items-center">
        <Text variant="base-large" weight="medium">{label}</Text>
        <DatePill label={formatMonthDay(value)} active={active} disabled={disabled} onPress={onToggle} className={disabled ? "opacity-50" : ""} />
      </Row>
      {active && <CalendarGrid value={value} minDate={minDate} maxDate={maxDate} onSelect={onSelect} />}
    </View>
  );
}

interface Props {
  start: Date;
  end: Date;
  minDate?: Date;
  maxDate?: Date;
  onChangeStart: (date: Date) => void;
  onChangeEnd: (date: Date) => void;
  disabledMessage?: string | null;
}

/**
 * 플랜 기간(시작·종료일) 입력 칸. 날짜를 누르면 그 줄 아래에 달력이 열리고, 날짜를 고르면 닫힘
 * @param start 시작일
 * @param end 종료일
 * @param minDate 고를 수 있는 가장 이른 날짜, 생략하면 제한 없음
 * @param maxDate 고를 수 있는 가장 늦은 날짜, 생략하면 제한 없음
 * @param onChangeStart 시작일을 고를 때 호출
 * @param onChangeEnd 종료일을 고를 때 호출
 * @param disabledMessage 주면 날짜를 바꿀 수 없게 막고 제목 아래에 이 이유를 보여줌
 */
export function PlanPeriodField({ start, end, minDate, maxDate, onChangeStart, onChangeEnd, disabledMessage = null }: Props) {
  const [activePicker, setActivePicker] = useState<PickerTarget | null>(null);
  const disabled = !!disabledMessage;

  const togglePicker = (target: PickerTarget) => {
    Keyboard.dismiss();
    setActivePicker((prev) => (prev === target ? null : target));
  };

  const selectDate = (target: PickerTarget, date: Date) => {
    if (target === "start") onChangeStart(date); else onChangeEnd(date);
    setActivePicker(null);
  };

  return (
    <Stack gap="s" width="full">
      <Text variant="base-medium">플랜 완료 시각</Text>
      {disabled && <Text variant="base-small" color="secondary">{disabledMessage}</Text>}
      <View className="w-full rounded-radius-4 overflow-hidden">
        <PeriodRow
          label="시작"
          value={start}
          minDate={minDate}
          maxDate={maxDate}
          active={activePicker === "start"}
          disabled={disabled}
          onToggle={() => togglePicker("start")}
          onSelect={(date) => selectDate("start", date)}
          className="border-b-2 border-neutral-600"
        />
        <PeriodRow
          label="종료"
          value={end}
          minDate={minDate}
          maxDate={maxDate}
          active={activePicker === "end"}
          disabled={disabled}
          onToggle={() => togglePicker("end")}
          onSelect={(date) => selectDate("end", date)}
        />
      </View>
    </Stack>
  );
}
