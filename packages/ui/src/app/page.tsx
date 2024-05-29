"use client";

import { Button, DatePicker, Flex, Input, List } from "antd";
import {
  CloudDownloadOutlined,
  SearchOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import styles from "./page.module.scss";
import Nav from "./Nav/Nav";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { GET, getApiUrl, handleRequest } from "@/modules/api/api";

interface AcarsMessage {
  id: number;
  time: number;
  freq: string;
  channel: number;
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

  const getMessages = () => {
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
  };

  useEffect(() => {
    if (searchKey === "") {
      setDisplayMessages(messages);
      return;
    }

    const filteredMessages: AcarsMessage[] = [];

    setDisplayMessages(filteredMessages);
  }, [searchKey, messages]);

  useEffect(getMessages, []);

  return (
    <main className={styles.main}>
      <Nav />
      <Flex className={styles.flexContentWrapper} vertical gap={20}>
        <Flex justify="space-between" gap={20} wrap>
          <Flex gap={20} wrap>
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
                onClick={() => {}}
                type="primary"
                icon={<CloudDownloadOutlined />}
                loading={filterLoading}>
                Get Messages
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
                onClick={() => {}}
                type="primary"
                icon={<SearchOutlined />}>
                Search
              </Button>
            </Flex>
          </Flex>

          <Flex gap={10}>
            <Button
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
        </Flex>

        <List
          bordered
          dataSource={displayMessages}
          renderItem={item => {
            return (
              <Flex vertical>
                <Flex>{item.flightNo}</Flex>
              </Flex>
            );
          }}
        />
      </Flex>
    </main>
  );
}
