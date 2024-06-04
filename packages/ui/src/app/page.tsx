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
  "freq" | "label" | "regNo" | "flightNo" | "msgNo" | "ack"
>;

interface FilterValueType {
  freq: string[];
  label: string[];
  regNo: (string | null)[];
  flightNo: (string | null)[];
  msgNo: (string | null)[];
  ack: (string | null)[];
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
  const timeRangeRef = useRef<[Dayjs, Dayjs]>(todayTimeRange);

  const [searchKey, setSearchKey] = useState("");

  const [messages, setMessages] = useState<AcarsMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<AcarsMessage[]>([]);

  const [filterLoading, setFilterLoading] = useState(false);

  const [brief, setBrief] = useState(false);

  const [libacarsModalOpen, setLibacarsModalOpen] = useState(false);
  const [libacars, setLibacars] = useState("{}");

  const pendingSearch = useRef<{
    pending: boolean;
    keyword: string;
  }>({
    pending: false,
    keyword: "",
  });

  const filterValues = useMemo<FilterValueType>(() => {
    const filterValueSets: Record<FilterableKeys, Set<string | null>> = {
      freq: new Set<string>(),
      label: new Set<string>(),
      regNo: new Set<string | null>(),
      flightNo: new Set<string | null>(),
      msgNo: new Set<string | null>(),
      ack: new Set<string | null>(),
    };

    const keys: FilterableKeys[] = [
      "freq",
      "label",
      "regNo",
      "flightNo",
      "msgNo",
      "ack",
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

  const applySearch = useCallback(() => {
    pendingSearch.current.keyword = searchKey.toLowerCase();

    if (pendingSearch.current.pending) {
      return;
    }

    pendingSearch.current.pending = true;

    setTimeout(() => {
      if (pendingSearch.current.keyword === "") {
        setDisplayMessages(messages);
      } else {
        setDisplayMessages(
          messages.filter(
            x =>
              x.text &&
              x.text.toLowerCase().includes(pendingSearch.current.keyword),
          ),
        );
      }

      pendingSearch.current.pending = false;
    }, 100);
  }, [searchKey, messages]);

  const syncMessages = useCallback(() => {
    setFilterLoading(true);

    handleRequest(
      GET("ACARS_GET_ALL_MESSAGES_IN_TIME_RANGE", {
        startS: timeRangeRef.current[0].unix(),
        endS: timeRangeRef.current[1].unix(),
      }),
      {
        onSuccess: (data: AcarsMessage[]) =>
          setMessages(data.sort(getNumberSorter("time", true))),
        onFinish: () => setFilterLoading(false),
      },
    );
  }, []);

  const columns = useMemo<TableProps<AcarsMessage>["columns"]>(
    () => [
      {
        title: "Text",
        dataIndex: "text",
        key: "text",
        align: "center",
        sorter: getStringSorter("text"),
        filters: [
          {
            text: "libacars decoded",
            value: true,
          },
          {
            text: "Not decoded",
            value: false,
          },
        ],
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
        sorter: (a, b) => parseFloat(a.freq) - parseFloat(b.freq),
        filters: filterValues.freq.map(x => ({
          text: x + "MHz",
          value: x,
        })),
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
        filters: filterValues.flightNo.map(x => ({
          text: x ?? "(Empty)",
          value: x as any,
        })),
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
        filters: filterValues.msgNo.map(x => ({
          text: x ?? "(Empty)",
          value: x as any,
        })),
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
        filters: filterValues.ack.map(x => ({
          text: x ?? "NACK",
          value: x as any,
        })),
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
    [filterValues],
  );

  useEffect(() => {
    syncMessages();

    const refetchIntervalId = setInterval(syncMessages, 10 * MS_PER_SEC);

    return () => clearInterval(refetchIntervalId);
  }, []);

  useEffect(applySearch, [searchKey, messages]);

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
                  timeRangeRef.current = range as [Dayjs, Dayjs];
                  syncMessages();
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
              value={searchKey}
              onChange={e => setSearchKey(e.target.value)}
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
                    startS: timeRangeRef.current[0].unix().toString(),
                    endS: timeRangeRef.current[1].unix().toString(),
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
              pageSizeOptions: [10, 20, 30, 50, 100, 200],
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
