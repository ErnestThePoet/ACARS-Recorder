import React from "react";
import {
  AcarsMessageFilterType,
  StatisticsType,
} from "@/modules/interface/acars.interface";
import { DatePicker, Flex, Input, Select, Spin } from "antd";
import styles from "./MessageFilterControls.module.scss";
import { useWindowSize } from "@/modules/hooks/use-window-size";

interface MessageFilterControlsProps {
  selectsLoading: boolean;
  statistics: StatisticsType;
  filter: AcarsMessageFilterType;
  onChange: (filterPatch: Partial<AcarsMessageFilterType>) => void;
}

interface FilterSelectType {
  key: keyof StatisticsType;
  label: string;
  nullLabel?: React.ReactNode;
  renderValue?: (value: string | number | boolean | null) => React.ReactNode;
}

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
    key: "libacars",
    label: "libacars",
    renderValue: value => (value ? "Has decoded info" : "No decoded info"),
  },
];

function renderFilterOptionLabel(
  filterSelectInfo: FilterSelectType,
  value: string | number | boolean | null,
): React.ReactNode {
  return value === null
    ? filterSelectInfo.nullLabel !== undefined
      ? filterSelectInfo.nullLabel
      : "(Null)"
    : filterSelectInfo.renderValue
    ? filterSelectInfo.renderValue(value)
    : value;
}

const MessageFilterControls: React.FC<MessageFilterControlsProps> = ({
  selectsLoading,
  statistics,
  filter,
  onChange,
}) => {
  const windowSize = useWindowSize();

  return (
    <Flex vertical gap={6}>
      <DatePicker.RangePicker
        showTime
        value={[filter.startTime, filter.endTime]}
        onChange={range => {
          if (range && range[0] && range[1]) {
            onChange({
              startTime: range[0],
              endTime: range[1],
            });
          }
        }}
      />

      <Spin spinning={selectsLoading}>
        <Flex gap={6} vertical={windowSize.vertical} wrap>
          {FILTER_SELECTS.map(x => (
            <Flex className={styles.flexControlRow} key={x.key} align="center">
              <span className="filter-label">{x.label}:</span>
              <Select
                className={
                  windowSize.vertical ? "filter-select-v" : "filter-select-h"
                }
                mode="multiple"
                allowClear
                options={statistics[x.key].map(item => ({
                  label: renderFilterOptionLabel(x, item.value),
                  value: item.value,
                }))}
                optionRender={(_, { index }) => (
                  <Flex gap={5}>
                    <span>
                      {renderFilterOptionLabel(
                        x,
                        statistics[x.key][index].value,
                      )}
                    </span>
                    <span>({statistics[x.key][index].count})</span>
                  </Flex>
                )}
                value={filter[x.key]}
                onChange={e =>
                  onChange({
                    [x.key]: e,
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
      />
    </Flex>
  );
};

export default MessageFilterControls;
