import { cardHue } from "./game";

export const CARD_W = 62;
export const CARD_H = 86;

type Props = {
  name: string | null;
  faceDown?: boolean;
  tapped?: boolean;
  size?: number; // 倍率
  highlight?: boolean;
  badge?: string;
  dim?: boolean;
};

/** 画像なしで名前を描画するカード。裏向き／名前不明なら裏面 */
export default function CardView({ name, faceDown, tapped, size = 1, highlight, badge, dim }: Props) {
  const w = CARD_W * size;
  const h = CARD_H * size;
  const back = faceDown || name === null;
  const hue = name ? cardHue(name) : 0;
  return (
    <div
      className="relative shrink-0 transition-transform duration-150"
      style={{ width: tapped ? h : w, height: tapped ? w : h }}
    >
      <div
        className={`absolute left-1/2 top-1/2 select-none overflow-hidden rounded-md border shadow-sm ${
          highlight ? "ring-2 ring-amber-400" : ""
        } ${dim ? "opacity-60" : ""}`}
        style={{
          width: w,
          height: h,
          transform: `translate(-50%, -50%) rotate(${tapped ? 90 : 0}deg)`,
          transition: "transform 150ms",
          borderColor: back ? "#1e293b" : `hsl(${hue} 45% 35%)`,
          background: back
            ? "repeating-linear-gradient(45deg,#1e3a8a 0 6px,#1e40af 6px 12px)"
            : `linear-gradient(160deg,hsl(${hue} 70% 92%),hsl(${hue} 55% 78%))`,
        }}
      >
        {back ? (
          <div className="flex h-full items-center justify-center">
            <div
              className="flex items-center justify-center rounded-full border-2 border-amber-300 bg-blue-950 font-bold text-amber-300"
              style={{ width: w * 0.55, height: w * 0.55, fontSize: 11 * size }}
            >
              DM
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col p-1" style={{ fontSize: Math.max(9, 10 * size) }}>
            <div
              className="rounded-sm px-0.5 py-px text-center font-bold leading-tight text-white"
              style={{ background: `hsl(${hue} 50% 38%)` }}
            >
              {name}
            </div>
            <div className="flex-1 rounded-sm" style={{ background: `hsl(${hue} 40% 96% / 0.6)` }} />
          </div>
        )}
        {badge && (
          <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[10px] font-bold text-white">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
