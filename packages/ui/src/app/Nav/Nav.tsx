"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./Nav.module.scss";
import { formatMsTimeHms } from "@/modules/utils/date-time.util";
import { Flex } from "antd";
import classNames from "classnames";
import { noto_Sans_Mono, palanquin_Dark } from "../fonts";
import {
  LOCAL_TIMEZONE_NAME,
  LOCAL_TIMEZONE_OFFSET,
} from "@/modules/constants";

const Nav: React.FC = () => {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [time, setTime] = useState(new Date().getTime());

  useEffect(() => {
    timer.current = setInterval(() => {
      setTime(new Date().getTime());
    }, 1000);

    return () => {
      if (timer.current !== null) {
        clearInterval(timer.current);
      }
    };
  }, []);

  return (
    <nav className={classNames(styles.nav, palanquin_Dark.className)}>
      ACARS Management Center
      <Flex
        className={classNames(styles.flexTime, noto_Sans_Mono.className)}
        vertical>
        <Flex align="flex-end">
          <span className={styles.spanTime}>{formatMsTimeHms(time)}</span>
          <span className={styles.spanTimeZone}>UTC</span>
        </Flex>

        <Flex align="flex-end">
          <span className={styles.spanTime}>
            {formatMsTimeHms(time, LOCAL_TIMEZONE_OFFSET)}
          </span>
          <span className={styles.spanTimeZone}>{LOCAL_TIMEZONE_NAME}</span>
        </Flex>
      </Flex>
    </nav>
  );
};

export default Nav;
