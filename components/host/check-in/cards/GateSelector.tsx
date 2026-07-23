type GateSelectorProps = {
  gate: string;
  onGateChange: (gate: string) => void;
};

const GATES = [
  "Main Gate",
  "VIP Entrance",
  "Gate A",
  "Gate B",
  "Box Office",
];

export default function GateSelector({
  gate,
  onGateChange,
}: GateSelectorProps) {
  return (
    <div>
      <label
        htmlFor="gate"
        className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500"
      >
        Current gate
      </label>

      <select
        id="gate"
        value={gate}
        onChange={(event) => onGateChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 text-sm font-semibold text-white outline-none transition focus:border-orange-400/60"
      >
        {GATES.map((gateOption) => (
          <option key={gateOption} value={gateOption}>
            {gateOption}
          </option>
        ))}
      </select>
    </div>
  );
}
