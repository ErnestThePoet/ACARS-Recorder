import React, { useState } from "react";
import styles from "./MessageFilter.module.scss";
import { AcarsMessageFilterType } from "@/modules/interface/acars.interface";
import { Collapse, Flex } from "antd";
import MessageFilterControls from "./MessageFilterControls/MessageFilterControls";

interface MessageFilterProps {
  onFilter: (filter: AcarsMessageFilterType) => void;
}

const MessageFilter: React.FC<MessageFilterProps> = ({ onFilter }) => {
  const [filter, setFilter] = useState<AcarsMessageFilterType>({
    freq: null,
    mode: null,
    label: null,
    subLabel: null,
    blockId: null,
    regNo: null,
    flightNo: null,
    msgNo: null,
    ack: null,
    reassemblyStatus: null,
    libacars: null,
    text: null,
  });

  return (
    <Collapse
      size="small"
      destroyInactivePanel
      items={[
        {
          key: 0,
          label: "Filters...",
          children: (
            <MessageFilterControls
              filter={filter}
              onChange={e => setFilter(e)}
            />
          ),
        },
      ]}
    />
  );
};

export default MessageFilter;
