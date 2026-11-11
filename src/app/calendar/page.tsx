"use client";

import { useState, type CSSProperties } from "react";

type Event = {
  date: string;
  title: string;
  time: string;
  place: string;
  description: string;
};

type OfficeHour = {
  teacher: string;
  weekday?: number[];
  dates?: string[];
  time: string;
  place: string;
  description: string;
};

// 通常のイベント
const events: Event[] = [];

// オフィスアワー
// 曜日：日曜=0、月曜=1、火曜=2、水曜=3、木曜=4、金曜=5、土曜=6
const officeHours: OfficeHour[] = [
  {
    teacher: "今井 順一（イマイ ジュンイチ）",
    weekday: [3],
    time: "13:00〜14:00",
    place: "津田沼キャンパス 7号館9階 認知情報科学科オフィス070915",
    description: "",
  },
  {
    teacher: "東本 崇仁（トウモト タカヒト）",
    weekday: [3],
    time: "13:00〜15:00",
    place: "7号館6階 第1研究室",
    description:
      "いつでもご相談ください。基本オフィスアワーにはいますが、事前に連絡を頂けると安心かもしれません。",
  },
  {
    teacher: "新井田 統（ニイダ スマル）",
    dates: [
      "2026-10-05",
      "2026-10-19",
      "2026-11-02",
      "2026-11-16",
      "2026-11-30",
      "2026-12-14",
      "2026-12-28",
      "2027-01-11",
      "2027-01-25",
      "2027-02-08",
      "2027-02-22",
      "2027-03-08",
      "2027-03-22",
    ],
    time: "11:00〜12:00",
    place: "1号館11階 021103",
    description:
      "この時間はアポイントメントなしで訪問して貰って構いません。他の時間の場合は事前に連絡をしてください。",
  },
  {
    teacher: "藤田 茂（フジタ シゲル）",
    weekday: [1],
    time: "15:00〜16:00",
    place: "津田沼校舎7号館8階 認知情報科学科オフィス1",
    description: "",
  },
  {
    teacher: "山崎 治（ヤマザキ オサム）",
    weekday: [1, 5],
    time: "17:00〜18:00",
    place: "津田沼キャンパス7号館6階 第2研究室",
    description: "",
  },
];

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

// カレンダーの色
const COLORS = {
  accent: "#c46b70",
  event: "#dbeafe",
  background: "#ffffff",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  normal: "#334155",
  sunday: "#dc2626",
  saturday: "#2563eb",
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      padding: "32px 20px",
      background: COLORS.background,
      color: COLORS.text,
      fontFamily: "Arial, sans-serif",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "24px",
    },
    monthGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "18px",
    },
    card: {
      background: "#ffffff",
      border: `1px solid ${COLORS.border}`,
      borderRadius: "12px",
      padding: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },
    daysGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
      gap: "4px 2px",
      textAlign: "center",
    },
    dayButton: {
      width: "100%",
      height: "34px",
      border: "1px solid transparent",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "13px",
    },
    details: {
      marginTop: "24px",
      padding: "20px",
      borderRadius: "12px",
      background: "#ffffff",
      border: `1px solid ${COLORS.border}`,
    },
  };

  // 選択した日の通常イベント
  const selectedEvents = events.filter(
    (event) => event.date === selectedDate
  );

  // 選択した日の曜日
  const selectedWeekday = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).getDay()
    : -1;

  // 選択した日のオフィスアワー
  const selectedOfficeHours = officeHours.filter((office) =>
    office.dates
      ? office.dates.includes(selectedDate ?? "")
      : office.weekday?.includes(selectedWeekday)
  );

  // 2026年10月から2027年3月までの6か月
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(2026, 9 + index, 1);

    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      firstDay: date.getDay(),
      daysInMonth: new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      ).getDate(),
    };
  });

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={{ fontSize: "30px", margin: "0 0 8px" }}>
            イベントカレンダー
          </h1>
          <p style={{ margin: 0, color: COLORS.muted }}>
            2026年10月〜2027年3月の企画・イベント予定
          </p>
        </header>

        {/* カレンダー */}
        <div style={styles.monthGrid}>
          {months.map(({ year, month, firstDay, daysInMonth }) => (
            <section key={`${year}-${month}`} style={styles.card}>
              <h2 style={{ fontSize: "20px", margin: "0 0 14px" }}>
                {year}年{month + 1}月
              </h2>

              <div style={styles.daysGrid}>
                {/* 曜日 */}
                {weekdays.map((weekday, index) => (
                  <div
                    key={weekday}
                    style={{
                      fontSize: "12px",
                      padding: "5px 0",
                      color:
                        index === 0
                          ? COLORS.sunday
                          : index === 6
                            ? COLORS.saturday
                            : COLORS.muted,
                      fontWeight: "bold",
                    }}
                  >
                    {weekday}
                  </div>
                ))}

                {/* 月初の空白 */}
                {Array.from({ length: firstDay }, (_, index) => (
                  <div key={`empty-${index}`} />
                ))}

                {/* 日付 */}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;

                  const date = [
                    year,
                    String(month + 1).padStart(2, "0"),
                    String(day).padStart(2, "0"),
                  ].join("-");

                  const hasEvent = events.some(
                    (event) => event.date === date
                  );

                  const weekday = new Date(year, month, day).getDay();

                  const hasOfficeHour = officeHours.some((office) =>
                    office.dates
                      ? office.dates.includes(date)
                      : office.weekday?.includes(weekday)
                  );

                  const isSelected = selectedDate === date;

                  // 今日の日付かどうかを判定
                  const today = new Date();

                  const isToday =
                    today.getFullYear() === year &&
                    today.getMonth() === month &&
                    today.getDate() === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      aria-label={`${year}年${month + 1}月${day}日${hasEvent ? "、イベントあり" : ""}${hasOfficeHour ? "、オフィスアワーあり" : ""}`}
                      onClick={() => setSelectedDate(date)}
                      style={{
                        ...styles.dayButton,

                        // 今日または選択した日は赤系
                        background:
                          isSelected || isToday
                            ? COLORS.accent
                            : hasEvent
                              ? COLORS.event
                              : "transparent",

                        // 文字色
                        color:
                          isSelected || isToday
                            ? "#ffffff"
                            : weekday === 0
                              ? COLORS.sunday
                              : weekday === 6
                                ? COLORS.saturday
                                : COLORS.normal,

                        // 今日または選択した日の枠
                        border:
                          isSelected || isToday
                            ? `1px solid ${COLORS.accent}`
                            : "1px solid transparent",

                        fontWeight:
                          hasEvent || hasOfficeHour || isSelected || isToday
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {day}
                      {hasEvent && !isSelected && !isToday ? " •" : ""}
                      {hasOfficeHour && !isSelected && !isToday ? " ○" : ""}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* 選択した日の予定詳細 */}
        <section style={styles.details}>
          <h2
            style={{
              fontSize: "20px",
              marginTop: 0,
              paddingLeft: "10px",
              borderLeft: `4px solid ${COLORS.accent}`,
            }}
          >
            {selectedDate
              ? `${selectedDate.replaceAll("-", "/")} の予定`
              : "予定の詳細"}
          </h2>

          {!selectedDate && (
            <p style={{ color: COLORS.muted }}>
              カレンダーの日付をクリックすると、予定を確認できます。
            </p>
          )}

          {/* オフィスアワー */}
          {selectedDate && selectedOfficeHours.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  fontSize: "17px",
                  color: "#6d28d9",
                  marginBottom: "12px",
                }}
              >
                オフィスアワー
              </h3>

              {selectedOfficeHours.map((office, index) => (
                <div
                  key={`${office.teacher}-${index}`}
                  style={{
                    padding: "14px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    background: "#f5f3ff",
                    border: "1px solid #ddd6fe",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 10px",
                      fontSize: "16px",
                      color: "#6d28d9",
                    }}
                  >
                    {office.teacher}
                  </h4>

                  <p style={{ margin: "6px 0" }}>
                    時間：{office.time}
                  </p>

                  <p style={{ margin: "6px 0" }}>
                    場所：{office.place}
                  </p>

                  {office.description && (
                    <p
                      style={{
                        margin: "10px 0 0",
                        lineHeight: 1.7,
                        fontSize: "14px",
                      }}
                    >
                      備考：{office.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 通常イベント */}
          {selectedEvents.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "17px",
                  color: COLORS.accent,
                  marginBottom: "12px",
                }}
              >
                イベント
              </h3>

              {selectedEvents.map((event, index) => (
                <div
                  key={`${event.date}-${event.title}-${index}`}
                  style={{
                    padding: "14px 0",
                    borderTop: `1px solid ${COLORS.border}`,
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 12px",
                      fontSize: "18px",
                      color: COLORS.accent,
                    }}
                  >
                    {event.title}
                  </h4>

                  <p>時間：{event.time}</p>
                  <p>場所：{event.place}</p>
                  <p style={{ lineHeight: 1.7 }}>
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 予定がない場合 */}
          {selectedDate &&
            selectedEvents.length === 0 &&
            selectedOfficeHours.length === 0 && (
              <p style={{ color: COLORS.muted }}>
                この日に予定はありません。
              </p>
            )}
        </section>

        {/* 色・マークの説明 */}
        <p
          style={{
            fontSize: "13px",
            color: COLORS.muted,
            marginTop: "16px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px 16px",
          }}
        >
          <span>
            <span style={{ color: COLORS.accent }}>■</span>
            {" "}今日の日付・選択中
          </span>

          <span>
            <span style={{ color: COLORS.event }}>■</span>
            {" "}イベントがある日
          </span>

          <span>
            ○ オフィスアワーがある日
          </span>
        </p>
      </div>
    </main>
  );
}