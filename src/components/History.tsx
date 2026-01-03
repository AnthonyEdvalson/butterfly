import type { NumberFormat } from '../types/NumberFormat';

interface HistoryEntry {
  a: bigint;
  op: string;
  b: bigint | null;
  result: bigint;
}

interface HistoryProps {
  history: HistoryEntry[];
  format: NumberFormat;
  inputBase: number;
  operand: bigint | null;
  operation: string | null;
  onEntryClick: (entry: HistoryEntry) => void;
}

function History({ history, format, inputBase, operand, operation, onEntryClick }: HistoryProps) {
  const displayBase = inputBase === 2 ? 16 : inputBase;
  const prefix = displayBase === 16 ? '0x' : '';

  const fmt = (value: bigint) => prefix + format.format(value, displayBase);

  const formatEntry = (entry: HistoryEntry) => {
    const a = fmt(entry.a);
    const result = fmt(entry.result);

    if (entry.b === null) {
      return `${entry.op}(${a}) = ${result}`;
    }

    const b = fmt(entry.b);
    return `${a} ${entry.op} ${b} = ${result}`;
  };

  if (operation && operand !== null) {
    return (
      <div className="history history-pending">
        {fmt(operand)} {operation}
      </div>
    );
  }

  if (history.length === 0) {
    return <div className="history history-empty">—</div>;
  }

  const entry = history[history.length - 1];

  return (
    <div className="history">
      <button className="history-entry" onClick={() => onEntryClick(entry)}>
        {formatEntry(entry)}
      </button>
    </div>
  );
}

export default History;
export type { HistoryEntry };
