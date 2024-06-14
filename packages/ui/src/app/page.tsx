"use client";

import {
  Button,
  Checkbox,
  DatePicker,
  Flex,
  Input,
  List,
  Modal,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { TableProps } from "antd";
import { SyncOutlined, ExportOutlined } from "@ant-design/icons";
import styles from "./page.module.scss";
import Nav from "./Nav/Nav";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { GET, getApiUrl, handleRequest } from "@/modules/api/api";
import { MS_PER_SEC, formatSTimeyMdHms } from "@/modules/utils/date-time.util";
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
  "libacars" | "freq" | "label" | "regNo" | "flightNo" | "msgNo" | "ack"
>;

interface ValueCountType<T> {
  value: T;
  count: number;
}

interface FieldFiltersType {
  libacars: ValueCountType<boolean>[];
  freq: ValueCountType<string>[];
  label: ValueCountType<string>[];
  regNo: ValueCountType<string | null>[];
  flightNo: ValueCountType<string | null>[];
  msgNo: ValueCountType<string | null>[];
  ack: ValueCountType<string | null>[];
}

function getFilterTextWithCount(text: string, count: number): string {
  return `${text} (${count})`;
}

function getTodayTimeRange(): [Dayjs, Dayjs] {
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
}

const todayTimeRange = getTodayTimeRange();

export default function Home() {
  const [timeRange, setTimeRange] = useState<[Dayjs, Dayjs]>(todayTimeRange);

  const [searchKey, setSearchKey] = useState("");
  const searchKeyRef = useRef("");

  const [messages, setMessages] = useState<AcarsMessage[]>([]);
  const messagesRef = useRef<AcarsMessage[]>([]);

  const [displayMessages, setDisplayMessages] = useState<AcarsMessage[]>([]);

  const [filterLoading, setFilterLoading] = useState(false);

  const [brief, setBrief] = useState(false);

  const [libacarsModalOpen, setLibacarsModalOpen] = useState(false);
  const [libacars, setLibacars] = useState("{}");

  const pendingSearch = useRef<{
    pending: boolean;
  }>({
    pending: false,
  });

  const fieldFilters = useMemo<FieldFiltersType>(() => {
    const filterValueCountMaps: Record<
      FilterableKeys,
      Map<string | boolean | null, number>
    > = {
      libacars: new Map<boolean, number>(),
      freq: new Map<string, number>(),
      label: new Map<string, number>(),
      regNo: new Map<string | null, number>(),
      flightNo: new Map<string | null, number>(),
      msgNo: new Map<string | null, number>(),
      ack: new Map<string | null, number>(),
    };

    // Process libacars individually
    const keys: FilterableKeys[] = [
      "freq",
      "label",
      "regNo",
      "flightNo",
      "msgNo",
      "ack",
    ];

    for (const message of displayMessages) {
      for (const key of keys) {
        if (filterValueCountMaps[key].has(message[key])) {
          filterValueCountMaps[key].set(
            message[key],
            filterValueCountMaps[key].get(message[key])! + 1,
          );
        } else {
          filterValueCountMaps[key].set(message[key], 1);
        }
      }

      const libacars = Boolean(message.libacars);

      if (filterValueCountMaps.libacars.has(libacars)) {
        filterValueCountMaps.libacars.set(
          libacars,
          filterValueCountMaps.libacars.get(libacars)! + 1,
        );
      } else {
        filterValueCountMaps.libacars.set(libacars, 1);
      }
    }

    const fieldFiltersResult: FieldFiltersType =
      {} as unknown as FieldFiltersType;

    for (const key of keys) {
      fieldFiltersResult[key] = Array.from(filterValueCountMaps[key])
        .sort((a, b) =>
          stringCompare(
            (a[0] as string | null) ?? "",
            (b[0] as string | null) ?? "",
          ),
        )
        .map(x => ({
          value: x[0],
          count: x[1],
        })) as any;
    }

    fieldFiltersResult.libacars = Array.from(filterValueCountMaps.libacars)
      .sort((a, b) => Number(b[0] as boolean) - Number(a[0] as boolean))
      .map(x => ({
        value: x[0],
        count: x[1],
      })) as ValueCountType<boolean>[];

    return fieldFiltersResult as FieldFiltersType;
  }, [displayMessages]);

  const columns = useMemo<TableProps<AcarsMessage>["columns"]>(
    () => [
      {
        title: "Text",
        dataIndex: "text",
        key: "text",
        align: "center",
        sorter: getStringSorter("text"),
        filters: fieldFilters.libacars.map(x => ({
          text: getFilterTextWithCount(
            x.value ? "libacars decoded" : "Not decoded",
            x.count,
          ),
          value: x.value,
        })),
        filterMode: "tree",
        onFilter: (value, record) => value === Boolean(record.libacars),
        render: (text, record) => (
          <Flex
            vertical
            align="flex-start"
            style={{
              minWidth: "380px",
            }}>
            <div
              className={classNames(
                { [styles.divAcarsText]: text !== null },
                noto_Sans_Mono.className,
              )}>
              {text}
            </div>

            {record.libacars && (
              <Button
                type="link"
                onClick={() => {
                  setLibacars(record.libacars!);
                  setLibacarsModalOpen(true);
                }}>
                libacars
              </Button>
            )}
          </Flex>
        ),
      },
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
        title: "Freq/L",
        dataIndex: "freq",
        key: "freq",
        align: "center",
        sorter: (a, b) =>
          parseFloat(a.freq) - parseFloat(b.freq) || a.level - b.level,
        filters: fieldFilters.freq.map(x => ({
          text: getFilterTextWithCount(x.value + "MHz", x.count),
          value: x.value,
        })),
        filterMode: "tree",
        filterSearch: (input, record) =>
          ((record.value as string) + "MHz").includes(input),
        onFilter: (value, record) => value === record.freq,
        render: (freq, record) => (
          <Flex
            vertical
            style={{
              width: "80px",
            }}>
            <span>{freq}MHz</span>
            <span>{record.level.toFixed(1)}dBm</span>
          </Flex>
        ),
      },
      {
        title: "Label",
        dataIndex: "label",
        key: "label",
        align: "center",
        sorter: getStringSorter("label"),
        filters: fieldFilters.label.map(x => ({
          text: getFilterTextWithCount(x.value, x.count),
          value: x.value,
        })),
        filterMode: "tree",
        filterSearch: (input, record) =>
          (record.value as string).includes(input),
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
        filters: fieldFilters.regNo.map(x => ({
          text: getFilterTextWithCount(x.value ?? "(Empty)", x.count),
          value: x.value as any,
        })),
        filterMode: "tree",
        filterSearch: (input, record) =>
          ((record.value as string) === "null"
            ? "(Empty)"
            : (record.value as string)
          ).includes(input),
        onFilter: (value, record) => value === record.regNo,
        render: (regNo, record) =>
          regNo && (
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
        filters: fieldFilters.flightNo.map(x => ({
          text: getFilterTextWithCount(x.value ?? "(Empty)", x.count),
          value: x.value as any,
        })),
        filterMode: "tree",
        filterSearch: (input, record) =>
          ((record.value as string) === "null"
            ? "(Empty)"
            : (record.value as string)
          ).includes(input),
        onFilter: (value, record) => value === record.flightNo,
        render: (flightNo, record) =>
          flightNo && (
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
        filters: fieldFilters.msgNo.map(x => ({
          text: getFilterTextWithCount(x.value ?? "(Empty)", x.count),
          value: x.value as any,
        })),
        filterMode: "tree",
        filterSearch: (input, record) =>
          ((record.value as string) === "null"
            ? "(Empty)"
            : (record.value as string)
          ).includes(input),
        onFilter: (value, record) => value === record.msgNo,
        render: msgNo =>
          msgNo && (
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
        title: "ACK",
        dataIndex: "ack",
        key: "ack",
        align: "center",
        sorter: (a, b) => stringCompare(a.ack ?? "NACK", b.ack ?? "NACK"),
        filters: fieldFilters.ack.map(x => ({
          text: getFilterTextWithCount(x.value ?? "NACK", x.count),
          value: x.value as any,
        })),
        filterMode: "tree",
        filterSearch: (input, record) =>
          ((record.value as string) === "null"
            ? "NACK"
            : (record.value as string)
          ).includes(input),
        onFilter: (value, record) => value === record.ack,
        render: ack => (
          <Flex
            justify="center"
            align="center"
            style={{
              width: "70px",
            }}>
            <Tag color="purple">{ack ?? "NACK"}</Tag>
          </Flex>
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
            <span>Error: {record.error}</span>
            <span>Mode: {record.mode}</span>
            {record.blockId && <span>Block ID: {record.blockId}</span>}
          </Flex>
        ),
      },
    ],
    [fieldFilters],
  );

  const applySearch = useCallback(() => {
    if (pendingSearch.current.pending) {
      return;
    }

    pendingSearch.current.pending = true;

    setTimeout(() => {
      if (searchKeyRef.current === "") {
        setDisplayMessages(messagesRef.current);
      } else {
        setDisplayMessages(
          messagesRef.current.filter(
            x =>
              x.text &&
              x.text.toLowerCase().includes(searchKeyRef.current.toLowerCase()),
          ),
        );
      }

      pendingSearch.current.pending = false;
    }, 100);
  }, []);

  const syncMessages = useCallback(() => {
    setFilterLoading(true);

    handleRequest(
      GET("ACARS_GET_ALL_MESSAGES_IN_TIME_RANGE", {
        startS: timeRange[0].unix(),
        endS: timeRange[1].unix(),
      }),
      {
        onSuccess: (data: AcarsMessage[]) => {
          setMessages(data);
          messagesRef.current = data;
        },
        onFinish: () => setFilterLoading(false),
      },
    );
  }, [timeRange]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(syncMessages, [timeRange]);

  useEffect(() => {
    const refetchIntervalId = setInterval(syncMessages, 10 * MS_PER_SEC);

    return () => clearInterval(refetchIntervalId);
  }, [syncMessages]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(applySearch, [searchKey, messages]);

  useEffect(() => setBrief(window.innerWidth < window.innerHeight), []);

  return (
    <main className={styles.main}>
      <Nav />
      <Flex className={styles.flexContentWrapper} vertical gap={20}>
        <Flex gap={20} align="center" wrap>
          <Flex gap={10}>
            <DatePicker.RangePicker
              showTime
              defaultValue={todayTimeRange}
              onChange={range => {
                if (range && range[0] && range[1]) {
                  setTimeRange(range as [Dayjs, Dayjs]);
                }
              }}
            />

            <Button
              onClick={syncMessages}
              type="text"
              shape="circle"
              icon={<SyncOutlined />}
              loading={filterLoading}
            />
          </Flex>

          <Flex gap={10}>
            <Input
              className={styles.inSearch}
              placeholder="Search ACARS text"
              value={searchKey}
              onChange={e => {
                setSearchKey(e.target.value);
                searchKeyRef.current = e.target.value;
              }}
              allowClear
            />
          </Flex>

          <Tag color={displayMessages.length ? "green" : "default"}>
            {displayMessages.length
              ? displayMessages.length > 1
                ? `${displayMessages.length} Messages`
                : `${displayMessages.length} Message`
              : "No Message"}
          </Tag>

          <Checkbox checked={brief} onChange={e => setBrief(e.target.checked)}>
            Brief
          </Checkbox>

          <Button
            className={styles.btnExport}
            disabled={messages.length === 0}
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

        {brief ? (
          <List
            className={styles.tableListAcars}
            bordered
            dataSource={displayMessages}
            pagination={{
              defaultPageSize: 30,
              pageSizeOptions: [10, 20, 30, 50, 100, 200],
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            renderItem={item => (
              <List.Item className={noto_Sans_Mono.className}>
                <div>
                  <div className={styles.divAcarsBriefInfo}>
                    <div>{`${formatSTimeyMdHms(
                      item.time,
                    )} UTC / ${formatSTimeyMdHms(
                      item.time,
                      LOCAL_TIMEZONE_OFFSET,
                    )} ${LOCAL_TIMEZONE_NAME}`}</div>

                    <div>
                      <Tooltip title={item.airlineDescription}>
                        <span
                          className={classNames({
                            [styles.withTooltip]:
                              item.airlineDescription !== null,
                          })}>
                          {`${item.flightNo ? item.flightNo + " " : ""}`}
                        </span>
                      </Tooltip>

                      <Tooltip title={item.aircraftDescription}>
                        <span
                          className={classNames({
                            [styles.withTooltip]:
                              item.aircraftDescription !== null,
                          })}>
                          {`${item.regNo ? item.regNo + " " : ""}`}
                        </span>
                      </Tooltip>

                      {`${item.freq}MHz `}

                      <Tooltip title={item.labelDescription}>
                        <span
                          className={classNames({
                            [styles.withTooltip]:
                              item.labelDescription !== null,
                          })}>
                          {item.label}
                        </span>
                      </Tooltip>

                      {`${item.subLabel ? "/" + item.subLabel : ""}${
                        item.msgNo ? " " + item.msgNo : ""
                      }`}
                    </div>

                    <div>{`L:${item.level} E:${item.error} M:${item.mode}${
                      item.blockId ? " BID:" + item.blockId : ""
                    } ACK:${item.ack ?? "NACK"}`}</div>
                  </div>

                  <div className={styles.divAcarsText}>
                    {item.text ?? "(No Text)"}
                  </div>

                  {item.libacars && (
                    <div className={styles.divAcarsBriefLibacarsButtonWrapper}>
                      <Button
                        className={styles.btnAcarsBriefLibacars}
                        type="link"
                        onClick={() => {
                          setLibacars(item.libacars!);
                          setLibacarsModalOpen(true);
                        }}>
                        libacars
                      </Button>
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Table
            className={styles.tableListAcars}
            rowKey="id"
            columns={columns}
            dataSource={displayMessages}
            pagination={{
              defaultPageSize: 30,
              pageSizeOptions: [10, 20, 30, 50, 100, 200],
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        )}
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
