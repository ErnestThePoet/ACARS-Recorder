"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./Nav.module.scss";
import { formatTimeHms } from "@/modules/utils/date-time.util";
import { Flex } from "antd";
import classNames from "classnames";
import { noto_Sans_Mono, palanquin_Dark } from "../fonts";

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
          <span className={styles.spanTime}>
            {formatTimeHms(time, "+00:00")}
          </span>
          <span className={styles.spanTimeZone}>UTC</span>
        </Flex>

        <Flex align="flex-end">
          <span className={styles.spanTime}>
            {formatTimeHms(time, "+08:00")}
          </span>
          <span className={styles.spanTimeZone}>CST</span>
        </Flex>
      </Flex>
    </nav>
  );
};

export default Nav;
