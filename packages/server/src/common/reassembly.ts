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

export function getReassemblyStatusString(
  reassemblyStatus: ReassemblyStatus,
): string {
  switch (reassemblyStatus) {
    case ReassemblyStatus.COMPLETE:
      return "Complete";
    case ReassemblyStatus.IN_PROGRESS:
      return "In Progress";
    case ReassemblyStatus.SKIPPED:
      return "Skipped";
    case ReassemblyStatus.DUPLICATE:
      return "Duplicate";
    case ReassemblyStatus.FRAG_OUT_OF_SEQUENCE:
      return "Out of Sequence";
    case ReassemblyStatus.ARGS_INVALID:
      return "Invalid";
    case ReassemblyStatus.UNKNOWN:
    default:
      return "Unknown";
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
