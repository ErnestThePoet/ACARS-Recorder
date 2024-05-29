"use client";

import {
  Button,
  DatePicker,
  Flex,
  Input,
  Modal,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { TableProps } from "antd";
import {
  SyncOutlined,
  SearchOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import styles from "./page.module.scss";
import Nav from "./Nav/Nav";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { GET, getApiUrl, handleRequest } from "@/modules/api/api";
import { formatSTimeyMdHms } from "@/modules/utils/date-time.util";
import {
  LOCAL_TIMEZONE_NAME,
  LOCAL_TIMEZONE_OFFSET,
} from "@/modules/constants";
import {
  getNumberSorter,
  getStringSorter,
  stringCompare,
} from "@/modules/utils/sortors";
import classNames from "classnames";
import { noto_Sans_Mono } from "./fonts";

interface AcarsMessage {
  id: number;
  time: number;
  freq: string;
  level: number;
  error: number;
  mode: string;
  label: string;
  subLabel: string | null;
  blockId: string | null;
  ack: string | null;
  regNo: string | null;
  flightNo: string | null;
  msgNo: string | null;
  text: string | null;
  libacars: string | null;

  labelDescription: string | null;
  aircraftDescription: string | null;
  airlineDescription: string | null;
}

type FilterableKeys = keyof Pick<
  AcarsMessage,
  "freq" | "label" | "regNo" | "flightNo" | "msgNo"
>;

interface FilterValueType {
  freq: string[];
  label: string[];
  regNo: (string | null)[];
  flightNo: (string | null)[];
  msgNo: (string | null)[];
}

export default function Home() {
  const [timeRange, setTimeRange] = useState<[Dayjs, Dayjs]>(() => {
    const now = new Date();
    return [
      dayjs(
        new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
      ),
      dayjs(
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        ),
      ),
    ];
  });

  const [searchKey, setSearchKey] = useState("");

  const [messages, setMessages] = useState<AcarsMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<AcarsMessage[]>([]);

  const [filterLoading, setFilterLoading] = useState(false);

  const [libacarsModalOpen, setLibacarsModalOpen] = useState(false);
  const [libacars, setLibacars] = useState("{}");

  const filterValues = useMemo<FilterValueType>(() => {
    const filterValueSets: Record<FilterableKeys, Set<string | null>> = {
      freq: new Set<string>(),
      label: new Set<string>(),
      regNo: new Set<string | null>(),
      flightNo: new Set<string | null>(),
      msgNo: new Set<string | null>(),
    };

    const keys: FilterableKeys[] = [
      "freq",
      "label",
      "regNo",
      "flightNo",
      "msgNo",
    ];

    for (const message of messages) {
      for (const key of keys) {
        filterValueSets[key].add(message[key]);
      }
    }

    const filterValuesUnsorted: Record<string, (string | null)[]> = {};
    for (const key of keys) {
      filterValuesUnsorted[key] = Array.from(filterValueSets[key]).sort(
        (a, b) => stringCompare(a ?? "", b ?? ""),
      );
    }

    return filterValuesUnsorted as unknown as FilterValueType;
  }, [messages]);

  const syncMessages = useCallback(() => {
    setFilterLoading(true);

    handleRequest(
      GET("ACARS_GET_ALL_MESSAGES_IN_TIME_RANGE", {
        startS: timeRange[0].unix(),
        endS: timeRange[1].unix(),
      }),
      {
        onSuccess: data => setMessages(data),
        onFinish: () => setFilterLoading(false),
      },
    );
  }, [timeRange]);

  const columns = useMemo<TableProps<AcarsMessage>["columns"]>(
    () => [
      {
        title: "Time",
        dataIndex: "time",
        key: "time",
        align: "center",
        sorter: getNumberSorter("time"),
        render: time => (
          <Flex
            vertical
            style={{
              width: "180px",
            }}>
            <span>{`${formatSTimeyMdHms(time)} UTC`}</span>
            <span>{`${formatSTimeyMdHms(
              time,
              LOCAL_TIMEZONE_OFFSET,
            )} ${LOCAL_TIMEZONE_NAME}`}</span>
          </Flex>
        ),
      },
      {
        title: "Freq",
        dataIndex: "freq",
        key: "freq",
        align: "center",
        sorter: (a, b) => parseFloat(a.freq) - parseFloat(b.freq),
        filters: filterValues.freq.map(x => ({
          text: x + "MHz",
          value: x,
        })),
        onFilter: (value, record) => value === record.freq,
        render: freq => (
          <div
            style={{
              width: "80px",
            }}>
            {freq + "MHz"}
          </div>
        ),
      },
      {
        title: "Misc",
        key: "misc",
        align: "center",
        render: (_, record) => (
          <Flex
            vertical
            align="flex-start"
            style={{
              width: "80px",
            }}>
            <span>Level: {record.level.toFixed(1)}</span>
            <span>Error: {record.error}</span>
            <span>Mode: {record.mode}</span>
            {record.blockId && <span>Block ID: {record.blockId}</span>}
            <span>ACK: {record.ack ?? "NACK"}</span>
          </Flex>
        ),
      },
      {
        title: "Label",
        dataIndex: "label",
        key: "label",
        align: "center",
        sorter: getStringSorter("label"),
        filters: filterValues.label.map(x => ({
          text: x,
          value: x,
        })),
        onFilter: (value, record) => value === record.label,
        render: (label, record) => (
          <Flex
            justify="center"
            gap={5}
            style={{
              width: "80px",
            }}>
            <Tooltip title={record.labelDescription}>
              <Tag
                className={classNames({
                  [styles.withTooltip]: record.labelDescription !== null,
                })}
                color="blue">
                {label}
              </Tag>
            </Tooltip>

            {record.subLabel && <Tag>{record.subLabel}</Tag>}
          </Flex>
        ),
      },
      {
        title: "AC Reg",
        dataIndex: "regNo",
        key: "regNo",
        align: "center",
        sorter: getStringSorter("regNo"),
        filters: filterValues.regNo.map(x => ({
          text: x ?? "(Empty)",
          value: x as any,
        })),
        onFilter: (value, record) => value === record.regNo,
        render: (regNo, record) => (
          <Tooltip title={record.aircraftDescription}>
            <div
              className={classNames({
                [styles.withTooltip]: record.aircraftDescription !== null,
              })}
              style={{
                width: "90px",
              }}>
              {regNo}
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Flight",
        dataIndex: "flightNo",
        key: "flightNo",
        align: "center",
        sorter: getStringSorter("flightNo"),
        filters: filterValues.flightNo.map(x => ({
          text: x ?? "(Empty)",
          value: x as any,
        })),
        onFilter: (value, record) => value === record.flightNo,
        render: (flightNo, record) => (
          <Tooltip title={record.airlineDescription}>
            <div
              className={classNames({
                [styles.withTooltip]: record.airlineDescription !== null,
              })}
              style={{
                width: "80px",
              }}>
              {flightNo}
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Msg No",
        dataIndex: "msgNo",
        key: "msgNo",
        align: "center",
        sorter: getStringSorter("msgNo"),
        filters: filterValues.msgNo.map(x => ({
          text: x ?? "(Empty)",
          value: x as any,
        })),
        onFilter: (value, record) => value === record.msgNo,
        render: msgNo => (
          <Flex
            justify="center"
            align="center"
            style={{
              width: "90px",
            }}>
            <Tag color="cyan">{msgNo}</Tag>
          </Flex>
        ),
      },
      {
        title: "Text",
        dataIndex: "text",
        key: "text",
        align: "center",
        sorter: getStringSorter("text"),
        render: text => (
          <div
            className={classNames(
              { [styles.divAcarsText]: text !== null },
              noto_Sans_Mono.className,
            )}
            style={{
              minWidth: "380px",
            }}>
            {text}
          </div>
        ),
      },
      {
        title: "libacars",
        dataIndex: "libacars",
        key: "libacars",
        align: "center",
        sorter: getStringSorter("libacars"),
        render: libacars => (
          <Flex
            justify="center"
            align="center"
            style={{
              width: "60px",
            }}>
            {libacars ? (
              <Button
                type="link"
                onClick={() => {
                  setLibacars(libacars);
                  setLibacarsModalOpen(true);
                }}>
                View
              </Button>
            ) : (
              " "
            )}
          </Flex>
        ),
      },
    ],
    [filterValues],
  );

  const applySearch = useCallback(() => {
    if (searchKey === "") {
      setDisplayMessages(messages);
      return;
    }

    setDisplayMessages(
      messages.filter(
        x => x.text && x.text.toLowerCase().includes(searchKey.toLowerCase()),
      ),
    );
  }, [searchKey, messages]);

  useEffect(applySearch, [messages]);

  useEffect(syncMessages, []);

  return (
    <main className={styles.main}>
      <Nav />
      <Flex className={styles.flexContentWrapper} vertical gap={20}>
        <Flex gap={20} align="center" wrap>
          <Flex gap={10}>
            <DatePicker.RangePicker
              showTime
              value={timeRange}
              onChange={range => {
                if (range && range[0] && range[1]) {
                  setTimeRange(range as [Dayjs, Dayjs]);
                }
              }}
            />

            <Button
              onClick={syncMessages}
              type="primary"
              icon={<SyncOutlined />}
              loading={filterLoading}>
              Sync
            </Button>
          </Flex>

          <Flex gap={10}>
            <Input
              className={styles.inSearch}
              value={searchKey}
              onChange={e => setSearchKey(e.target.value)}
              allowClear
            />

            <Button
              onClick={applySearch}
              type="primary"
              icon={<SearchOutlined />}>
              Search
            </Button>
          </Flex>

          <Tag color={displayMessages.length ? "green" : "default"}>
            {displayMessages.length
              ? displayMessages.length > 1
                ? `${displayMessages.length} Messages`
                : `${displayMessages.length} Message`
              : "No Message"}
          </Tag>

          <Button
            className={styles.btnExport}
            onClick={() => {
              window.open(
                getApiUrl("ACARS_EXPORT_ALL_MESSAGES_IN_TIME_RANGE") +
                  "?" +
                  new URLSearchParams({
                    startS: timeRange[0].unix().toString(),
                    endS: timeRange[1].unix().toString(),
                  }),
              );
            }}
            type="primary"
            icon={<ExportOutlined />}>
            Export
          </Button>
        </Flex>

        <Table
          className={styles.tableAcars}
          rowKey="id"
          columns={columns}
          dataSource={displayMessages}
          pagination={{
            pageSizeOptions: [10, 20, 30, 50, 100, 200],
            showQuickJumper: true,
          }}
        />
      </Flex>

      <Modal
        open={libacarsModalOpen}
        title="libacars Decoded Information"
        centered
        footer={null}
        onCancel={() => setLibacarsModalOpen(false)}>
        <div
          className={classNames(styles.divLibacars, noto_Sans_Mono.className)}>
          {`${JSON.stringify(JSON.parse(libacars), null, 2)}`}
        </div>
      </Modal>
    </main>
  );
}
