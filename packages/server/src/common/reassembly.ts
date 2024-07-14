export enum ReassemblyStatus {
  UNKNOWN = 0,
  COMPLETE,
  IN_PROGRESS,
  SKIPPED,
  DUPLICATE,
  FRAG_OUT_OF_SEQUENCE,
  ARGS_INVALID,
}

export function getReassemblyStatus(assstat: string | null): ReassemblyStatus {
  switch (assstat) {
    case "complete":
      return ReassemblyStatus.COMPLETE;
    case "in progress":
      return ReassemblyStatus.IN_PROGRESS;
    case "skipped":
      return ReassemblyStatus.SKIPPED;
    case "duplicate":
      return ReassemblyStatus.DUPLICATE;
    case "out of sequence":
      return ReassemblyStatus.FRAG_OUT_OF_SEQUENCE;
    case "invalid args":
      return ReassemblyStatus.ARGS_INVALID;
    case "unknown":
    default:
      return ReassemblyStatus.UNKNOWN;
  }
}

function charCode(char: string) {
  return char.charCodeAt(0);
}

function isDownLink(blockId: string) {
  const blockIdCharCode = charCode(blockId);
  return charCode("0") <= blockIdCharCode && blockIdCharCode <= charCode("9");
}

export function getSequenceChar(blockId: string, msgNo: string | null) {
  return isDownLink(blockId) ? msgNo![3] : blockId;
}
