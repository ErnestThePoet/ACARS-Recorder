"use client";

import {
  Button,
  Checkbox,
  Flex,
  FloatButton,
  List,
  Modal,
  Table,
  Tag,
  Tooltip,
} from "antd";
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
import classNames from "classnames";
import { noto_Sans_Mono } from "./fonts";
import { getReassemblyStatusString } from "@/modules/reassembly";
import {
  AcarsMessage,
  AcarsMessageFilterType,
} from "@/modules/interface/acars.interface";
import MessageFilter from "./MessageFilter/MessageFilter";
import { getApiUrl, handleRequest, POST } from "@/modules/api/api";
import { OrderDirection } from "@/modules/order-direction";

const todayTimeRange = getTodayTimeRange();

const DEFAULT_PAGE_SIZE = 30;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100, 200];

interface PaginationState {
  currentPage: number;
  pageSize: number;
}

export default function Home() {
  const [messages, setMessages] = useState<{
    totalCount: number;
    currentPageMessages: AcarsMessage[];
  }>({
    totalCount: 0,
    currentPageMessages: [],
  });

  const [queryLoading, setQueryLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const paginationStateRef = useRef<PaginationState>({
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const orderState = useRef<{
    orderBy: string | null;
    orderDirection: OrderDirection | null;
  }>({
    orderBy: null,
    orderDirection: null,
  });

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
        sorter: true,
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
        sorter: true,
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
        sorter: true,
        render: (freq, record) => (
          <Flex vertical>
            <span>{freq}MHz</span>
            <span>{record.level.toFixed(1)}dBm</span>
          </Flex>
        ),
      },
      {
        title: "Label/Sub Label",
        dataIndex: "label",
        key: "label",
        align: "center",
        sorter: true,
        render: (label, record) => (
          <Flex vertical align="center" gap={6}>
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
        title: "Flight/AC Reg",
        dataIndex: "flightNo",
        key: "flightNo",
        align: "center",
        sorter: true,
        render: (flightNo, record) => (
          <Flex
            vertical
            align="center"
            style={{
              width: "90px",
            }}>
            {flightNo && (
              <Tooltip title={record.airlineDescription}>
                <div
                  className={classNames({
                    [styles.withTooltip]: record.airlineDescription !== null,
                  })}>
                  {flightNo}
                </div>
              </Tooltip>
            )}
            {record.regNo && (
              <Tooltip title={record.aircraftDescription}>
                <div
                  className={classNames({
                    [styles.withTooltip]: record.aircraftDescription !== null,
                  })}>
                  {record.regNo}
                </div>
              </Tooltip>
            )}
          </Flex>
        ),
      },
      {
        title: "Blk ID/Msg No",
        dataIndex: "blockId",
        key: "blockId",
        align: "center",
        sorter: true,
        render: (blockId, record) => (
          <Flex
            vertical
            align="center"
            gap={6}
            style={{
              width: "90px",
            }}>
            {blockId && <Tag color="purple">{blockId}</Tag>}
            {record.msgNo && <Tag color="cyan">{record.msgNo}</Tag>}
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
              width: "110px",
              wordBreak: "break-all",
            }}>
            <span>Error: {record.error}</span>
            <span>Mode: {record.mode}</span>
            <span>ACK: {record.ack ?? "NACK"}</span>
            <span>
              Reasm: {getReassemblyStatusString(record.reassemblyStatus)}
            </span>
          </Flex>
        ),
      },
    ],
    [],
  );

  const syncMessages = useCallback(() => {
    setQueryLoading(true);

    handleRequest(
      POST("ACARS_GET_MESSAGES", {
        startS: queryFilter.current.startTime.unix(),
        endS: queryFilter.current.endTime.unix(),
        text: queryFilter.current.text,
        freq: queryFilter.current.freq,
        label: queryFilter.current.label,
        blockId: queryFilter.current.blockId,
        regNo: queryFilter.current.regNo,
        flightNo: queryFilter.current.flightNo,
        msgNo: queryFilter.current.msgNo,
        libacars: queryFilter.current.libacars,
        pageIndex: paginationStateRef.current.currentPage - 1,
        pageSize: paginationStateRef.current.pageSize,
        orderBy: orderState.current.orderBy,
        orderDirection: orderState.current.orderDirection,
      }),
      {
        onSuccess: data => {
          setMessages(data);
        },
        onFinish: () => setQueryLoading(false),
      },
    );
  }, []);

  useEffect(() => {
    if (brief) {
      orderState.current = {
        orderBy: null,
        orderDirection: null,
      };
    }
  }, [brief]);

  useEffect(() => {
    const refetchIntervalId = setInterval(syncMessages, 10 * MS_PER_SEC);

    return () => clearInterval(refetchIntervalId);
  }, [syncMessages]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(syncMessages, []);

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
              syncMessages();
            }}
          />

          <Tag color={messages.totalCount ? "green" : "default"}>
            {messages.totalCount
              ? messages.totalCount > 1
                ? `${messages.totalCount} Messages`
                : `${messages.totalCount} Message`
              : "No Message"}
          </Tag>

          <Checkbox checked={brief} onChange={e => setBrief(e.target.checked)}>
            Brief
          </Checkbox>

          <Button
            className={styles.btnExport}
            disabled={messages.totalCount === 0}
            loading={exportLoading}
            onClick={async () => {
              setExportLoading(true);

              const response = await fetch(getApiUrl("ACARS_EXPORT_MESSAGES"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  startS: queryFilter.current.startTime.unix(),
                  endS: queryFilter.current.endTime.unix(),
                  text: queryFilter.current.text,
                  freq: queryFilter.current.freq,
                  label: queryFilter.current.label,
                  blockId: queryFilter.current.blockId,
                  regNo: queryFilter.current.regNo,
                  flightNo: queryFilter.current.flightNo,
                  msgNo: queryFilter.current.msgNo,
                  libacars: queryFilter.current.libacars,
                }),
              });

              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download =
                response.headers
                  .get("Content-Disposition")
                  ?.split("filename=")[1] ?? "export.xlsx";
              a.click();

              setExportLoading(false);
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
            dataSource={messages.currentPageMessages}
            pagination={{
              current: paginationState.currentPage,
              pageSize: paginationState.pageSize,
              total: messages.totalCount,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showSizeChanger: true,
              showQuickJumper: true,
              onChange: (currentPage, pageSize) => {
                paginationStateRef.current = {
                  currentPage,
                  pageSize,
                };

                setPaginationState(paginationStateRef.current);

                syncMessages();
              },
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
            dataSource={messages.currentPageMessages}
            onChange={(pagination, _, sorter: any) => {
              paginationStateRef.current = {
                currentPage: pagination.current ?? 1,
                pageSize: pagination.pageSize ?? DEFAULT_PAGE_SIZE,
              };

              setPaginationState(paginationStateRef.current);

              orderState.current = {
                orderBy: sorter.order ? sorter.field : null,
                orderDirection: sorter.order
                  ? sorter.order === "ascend"
                    ? OrderDirection.ASC
                    : OrderDirection.DESC
                  : null,
              };

              syncMessages();
            }}
            pagination={{
              current: paginationState.currentPage,
              pageSize: paginationState.pageSize,
              total: messages.totalCount,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        )}
      </Flex>

      <FloatButton.BackTop visibilityHeight={0} />

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
