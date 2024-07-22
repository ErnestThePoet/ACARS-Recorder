import React, { useCallback, useState } from "react";
import styles from "./MessageFilter.module.scss";
import { AcarsMessageFilterType } from "@/modules/interface/acars.interface";
import { Button, Collapse, Flex } from "antd";
import {
  DeleteOutlined,
  SyncOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import MessageFilterControls from "./MessageFilterControls/MessageFilterControls";
import { getTodayTimeRange } from "@/modules/utils/date-time.util";
import { handleRequest, REQ } from "@/modules/api/api";
import { Dayjs } from "dayjs";
import { useWindowSize } from "@/modules/hooks/use-window-size";
import {
  GetStatisticsDto,
  GetStatisticsFilters,
  GetStatisticsResponse,
} from "@/modules/api/api.interface";

interface MessageFilterProps {
  queryLoading: boolean;
  onFilter: (filter: AcarsMessageFilterType) => void;
}

const todayTimeRange = getTodayTimeRange();

const MessageFilter: React.FC<MessageFilterProps> = ({
  queryLoading,
  onFilter,
}) => {
  const windowSize = useWindowSize();

  const [showFilterControlButtons, setShowFilterControlButtons] =
    useState(false);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  const [filter, setFilter] = useState<AcarsMessageFilterType>({
    startTime: todayTimeRange[0],
    endTime: todayTimeRange[1],
    freq: [],
    label: [],
    blockId: [],
    regNo: [],
    flightNo: [],
    msgNo: [],
    reassemblyStatus: [],
    libacars: [],
    text: "",
  });

  const [statisticsFilters, setStatisticsFilters] =
    useState<GetStatisticsFilters>({
      freq: [],
      label: [],
      blockId: [],
      regNo: [],
      flightNo: [],
      msgNo: [],
      reassemblyStatus: [],
      libacars: [],
    });

  const updateStatistics = useCallback((startTime: Dayjs, endTime: Dayjs) => {
    setStatisticsLoading(true);

    handleRequest(
      REQ<GetStatisticsDto, GetStatisticsResponse>("ACARS_GET_STATISTICS", {
        startS: startTime.unix(),
        endS: endTime.unix(),
      }),
      {
        onSuccess: data => {
          setStatisticsFilters(data.filters);
        },
        onFinish: () => setStatisticsLoading(false),
      },
    );
  }, []);

  return (
    <Collapse
      className={
        windowSize.vertical
          ? styles.collapseMessageFilterV
          : styles.collapseMessageFilterH
      }
      size="small"
      onChange={e => {
        setShowFilterControlButtons(e.length > 0);

        if (e.length > 0) {
          updateStatistics(filter.startTime, filter.endTime);
        }
      }}
      items={[
        {
          key: 0,
          label: "Message Filters",
          children: (
            <MessageFilterControls
              selectsLoading={statisticsLoading}
              statisticsFilters={statisticsFilters}
              filter={filter}
              onChange={e => {
                setFilter(value => ({
                  ...value,
                  ...e,
                }));

                if (e.startTime || e.endTime) {
                  const startTime = e.startTime || filter.startTime;
                  const endTime = e.endTime || filter.endTime;

                  updateStatistics(startTime, endTime);
                }
              }}
              onTextPressEnter={() => onFilter(filter)}
            />
          ),
          extra: (
            <Flex gap={5}>
              {showFilterControlButtons && (
                <Button
                  onClick={e => {
                    e.stopPropagation();

                    setFilter(value => ({
                      startTime: value.startTime,
                      endTime: value.endTime,
                      freq: [],
                      label: [],
                      blockId: [],
                      regNo: [],
                      flightNo: [],
                      msgNo: [],
                      reassemblyStatus: [],
                      libacars: [],
                      text: "",
                    }));
                  }}
                  type="link"
                  icon={<DeleteOutlined />}
                />
              )}

              {showFilterControlButtons && (
                <Button
                  loading={statisticsLoading}
                  onClick={e => {
                    e.stopPropagation();

                    updateStatistics(filter.startTime, filter.endTime);
                  }}
                  type="link"
                  icon={<SyncOutlined />}
                />
              )}

              <Button
                className={styles.btnQuery}
                onClick={e => {
                  e.stopPropagation();
                  onFilter(filter);
                }}
                type="primary"
                icon={<SearchOutlined />}
                loading={queryLoading}>
                Query
              </Button>
            </Flex>
          ),
        },
      ]}
    />
  );
};

export default MessageFilter;
