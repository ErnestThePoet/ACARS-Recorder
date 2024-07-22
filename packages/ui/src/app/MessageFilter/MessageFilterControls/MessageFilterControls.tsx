import React from "react";
import { AcarsMessageFilterType } from "@/modules/interface/acars.interface";
import { DatePicker, Flex, Input, Select, Spin } from "antd";
import styles from "./MessageFilterControls.module.scss";
import { useWindowSize } from "@/modules/hooks/use-window-size";
import {
  getReassemblyStatusString,
  ReassemblyStatus,
} from "@/modules/reassembly";
import { GetStatisticsFilters } from "@/modules/api/api.interface";

interface MessageFilterControlsProps {
  selectsLoading: boolean;
  statisticsFilters: GetStatisticsFilters;
  filter: AcarsMessageFilterType;
  onChange: (filterPatch: Partial<AcarsMessageFilterType>) => void;
  onTextPressEnter: () => void;
}

interface FilterSelectType {
  key: keyof GetStatisticsFilters;
  label: string;
  nullLabel?: string;
  renderValue?: (value: string | number | boolean) => string;
}

const SELECT_NULL_VALUE = "__null__";

const FILTER_SELECTS: FilterSelectType[] = [
  {
    key: "freq",
    label: "Freq",
  },
  {
    key: "regNo",
    label: "A/C Reg",
  },
  {
    key: "flightNo",
    label: "Flight",
  },
  {
    key: "label",
    label: "Label",
  },
  {
    key: "blockId",
    label: "Block ID",
  },
  {
    key: "msgNo",
    label: "Msg No",
  },
  {
    key: "reassemblyStatus",
    label: "Asm",
    renderValue: value => getReassemblyStatusString(value as ReassemblyStatus),
  },
  {
    key: "libacars",
    label: "libacars",
    renderValue: value => (value ? "Has decoded info" : "No decoded info"),
  },
];

function renderFilterOptionLabel(
  filterSelectInfo: FilterSelectType,
  value: string | number | boolean,
): string {
  return value === SELECT_NULL_VALUE
    ? filterSelectInfo.nullLabel !== undefined
      ? filterSelectInfo.nullLabel
      : "(Null)"
    : filterSelectInfo.renderValue
    ? filterSelectInfo.renderValue(value)
    : value.toString();
}

const MessageFilterControls: React.FC<MessageFilterControlsProps> = ({
  selectsLoading,
  statisticsFilters,
  filter,
  onChange,
  onTextPressEnter,
}) => {
  const windowSize = useWindowSize();

  return (
    <Flex vertical gap={6}>
      <DatePicker.RangePicker
        showTime
        placement={windowSize.vertical ? "bottomRight" : "bottomLeft"}
        value={[filter.startTime, filter.endTime]}
        onCalendarChange={range => {
          if (range[0] && range[1]) {
            const isReversed = range[0].diff(range[1]) > 0;

            onChange({
              startTime: isReversed ? range[1] : range[0],
              endTime: isReversed ? range[0] : range[1],
            });
          }
        }}
      />

      <Spin spinning={selectsLoading}>
        <Flex gap={6} vertical={windowSize.vertical} wrap>
          {FILTER_SELECTS.map(x => (
            <Flex
              key={x.key}
              className={styles.flexControlRow}
              gap={6}
              align="center">
              <span className="filter-label">{x.label}:</span>
              <Select
                className={
                  windowSize.vertical ? "filter-select-v" : "filter-select-h"
                }
                mode="multiple"
                allowClear
                options={statisticsFilters[x.key].map(item => ({
                  label: renderFilterOptionLabel(
                    x,
                    item.value ?? SELECT_NULL_VALUE,
                  ),
                  value: item.value ?? SELECT_NULL_VALUE,
                  count: item.count,
                }))}
                optionRender={({ data }) => {
                  const { value, count } = data;
                  return (
                    <Flex gap={5}>
                      <span>{renderFilterOptionLabel(x, value)}</span>
                      <span>({count})</span>
                    </Flex>
                  );
                }}
                filterOption={(inputValue, option) => {
                  if (!option) {
                    return false;
                  }

                  return renderFilterOptionLabel(x, option.value)
                    .toLowerCase()
                    .includes(inputValue.toLowerCase());
                }}
                value={filter[x.key].map(x =>
                  x === null ? SELECT_NULL_VALUE : x,
                )}
                onChange={e =>
                  onChange({
                    [x.key]: e.map(x => (x === SELECT_NULL_VALUE ? null : x)),
                  })
                }
              />
            </Flex>
          ))}
        </Flex>
      </Spin>

      <Input
        placeholder="ACARS text"
        allowClear
        value={filter.text}
        onChange={e => {
          onChange({
            text: e.target.value,
          });
        }}
        onPressEnter={onTextPressEnter}
      />
    </Flex>
  );
};

export default React.memo(MessageFilterControls);
