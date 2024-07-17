export enum ReassemblyStatus {
  UNKNOWN = 0,
  COMPLETE,
  IN_PROGRESS,
  SKIPPED,
  DUPLICATE,
  FRAG_OUT_OF_SEQUENCE,
  ARGS_INVALID,
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

export function getReassemblyStatusChar(
  reassemblyStatus: ReassemblyStatus,
): string {
  switch (reassemblyStatus) {
    case ReassemblyStatus.COMPLETE:
      return "C";
    case ReassemblyStatus.IN_PROGRESS:
      return "P";
    case ReassemblyStatus.SKIPPED:
      return "S";
    case ReassemblyStatus.DUPLICATE:
      return "D";
    case ReassemblyStatus.FRAG_OUT_OF_SEQUENCE:
      return "O";
    case ReassemblyStatus.ARGS_INVALID:
      return "I";
    case ReassemblyStatus.UNKNOWN:
    default:
      return "U";
  }
}

function charCode(char: string) {
  return char.charCodeAt(0);
}

export function isDownLink(blockId: string) {
  const blockIdCharCode = charCode(blockId);
  return charCode("0") <= blockIdCharCode && blockIdCharCode <= charCode("9");
}
