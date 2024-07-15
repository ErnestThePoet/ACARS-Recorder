"use client";

import { Button, Checkbox, Flex, List, Modal, Table, Tag, Tooltip } from "antd";
import type { TableProps } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import styles from "./page.module.scss";
import Nav from "./Nav/Nav";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MS_PER_SEC,
  formatSTimeyMdHms,
  getTodayTimeRange,
} from "@/modules/utils/date-time.util";
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
import { getReassemblyStatusString } from "@/modules/reassembly";
import {
  AcarsMessage,
  AcarsMessageFilterType,
} from "@/modules/interface/acars.interface";
import MessageFilter from "./MessageFilter/MessageFilter";
import { handleRequest, POST } from "@/modules/api/api";

const todayTimeRange = getTodayTimeRange();

export default function Home() {
  const [messages, setMessages] = useState<AcarsMessage[]>([]);

  const [queryLoading, setQueryLoading] = useState(false);

  const [brief, setBrief] = useState(false);

  const [libacarsModalOpen, setLibacarsModalOpen] = useState(false);
  const [libacars, setLibacars] = useState("{}");

  const queryFilter = useRef<AcarsMessageFilterType>({
    startTime: todayTimeRange[0],
    endTime: todayTimeRange[1],
    freq: [],
    label: [],
    blockId: [],
    regNo: [],
    flightNo: [],
    msgNo: [],
    libacars: [],
    text: "",
  });

  const columns = useMemo<TableProps<AcarsMessage>["columns"]>(
    () => [
      {
        title: "Text",
        dataIndex: "text",
        key: "text",
        align: "center",
        sorter: getStringSorter("text"),
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
            <span>
              Reasm: {getReassemblyStatusString(record.reassemblyStatus)}
            </span>
          </Flex>
        ),
      },
    ],
    [],
  );

  const syncMessages = useCallback((filter: AcarsMessageFilterType) => {
    setQueryLoading(true);

    handleRequest(
      POST("ACARS_GET_MESSAGES", {
        startS: filter.startTime.unix(),
        endS: filter.endTime.unix(),
        text: filter.text,
        freq: filter.freq,
        label: filter.label,
        blockId: filter.blockId,
        regNo: filter.regNo,
        flightNo: filter.flightNo,
        msgNo: filter.msgNo,
        libacars: filter.libacars,
        pageIndex: 0,
        pageSize: 20,
      }),
      {
        onSuccess: (data: AcarsMessage[]) => {
          setMessages(data);
        },
        onFinish: () => setQueryLoading(false),
      },
    );
  }, []);

  useEffect(() => {
    const refetchIntervalId = setInterval(
      () => syncMessages(queryFilter.current),
      10 * MS_PER_SEC,
    );

    return () => clearInterval(refetchIntervalId);
  }, [syncMessages]);

  useEffect(() => {
    syncMessages(queryFilter.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => setBrief(window.innerWidth < window.innerHeight), []);

  return (
    <main className={styles.main}>
      <Nav />
      <Flex className={styles.flexContentWrapper} vertical gap={20}>
        <Flex gap={20} align="center" wrap>
          <MessageFilter
            queryLoading={queryLoading}
            onFilter={e => {
              queryFilter.current = e;
              syncMessages(e);
            }}
          />

          <Tag color={messages.length ? "green" : "default"}>
            {messages.length
              ? messages.length > 1
                ? `${messages.length} Messages`
                : `${messages.length} Message`
              : "No Message"}
          </Tag>

          <Checkbox checked={brief} onChange={e => setBrief(e.target.checked)}>
            Brief
          </Checkbox>

          <Button
            className={styles.btnExport}
            disabled={messages.length === 0}
            onClick={() => {
              // window.open(
              //   getApiUrl("ACARS_EXPORT_ALL_MESSAGES_IN_TIME_RANGE") +
              //     "?" +
              //     new URLSearchParams({
              //       startS: timeRange[0].unix().toString(),
              //       endS: timeRange[1].unix().toString(),
              //     }),
              // );
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
            dataSource={messages}
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
            dataSource={messages}
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
