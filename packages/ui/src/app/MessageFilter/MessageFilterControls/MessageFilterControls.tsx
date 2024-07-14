import React, { useEffect } from "react";
import { AcarsMessageFilterType } from "@/modules/interface/acars.interface";
import { Flex } from "antd";
import { GET, handleRequest } from "@/modules/api/api";

interface MessageFilterControlsProps {
    filter: AcarsMessageFilterType;
  onChange: (filter: AcarsMessageFilterType) => void;
}

const MessageFilterControls: React.FC<MessageFilterControlsProps> = ({
  filter,
  onChange,
}) => {
  useEffect(() => {
    handleRequest(GET(""))
  }, []);
  return (
    <Flex vertical>
      <Flex>
              <span className="filter-label">Frequency:</span>
              
      </Flex>
    </Flex>
  );
};

export default MessageFilterControls;
