
"use client";

import { useState, type CSSProperties } from "react";

type Event = {
  date: string;
  title: string;
  time: string;
  place: string;
  description: string;
};

// 予定を追加するときは、この部分に書く
const events: Event[] = [];

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const styles: Record<string, CSSProperties> = {
    page: {
  minHeight: "100vh",
  padding: "32px 20px",
  background: "#ffffff",
  color: "#1e293b",
  fontFamily: "Arial, sans-serif",
},
    container: { maxWidth: "1200px", margin: "0 auto" },
    header: { marginBottom: "24px" },
    monthGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "18px",
    },
    card: {
      background: "white",
      border: "1px solid #e2e8f0",
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
      background: "white",
      border: "1px solid #e2e8f0",
    },
  };

  const selectedEvents = events.filter(
    (event) => event.date === selectedDate
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
          <p style={{ margin: 0, color: "#64748b" }}>
            2026年10月〜2027年3月の企画・イベント予定
          </p>
        </header>

        <div style={styles.monthGrid}>
          {months.map(({ year, month, firstDay, daysInMonth }) => (
            <section key={`${year}-${month}`} style={styles.card}>
              <h2 style={{ fontSize: "20px", margin: "0 0 14px" }}>
                {year}年{month + 1}月
              </h2>

              <div style={styles.daysGrid}>
                {weekdays.map((weekday, index) => (
                  <div
                    key={weekday}
                    style={{
                      fontSize: "12px",
                      padding: "5px 0",
                      color:
                        index === 0
                          ? "#dc2626"
                          : index === 6
                            ? "#2563eb"
                            : "#64748b",
                      fontWeight: "bold",
                    }}
                  >
                    {weekday}
                  </div>
                ))}

                {Array.from({ length: firstDay }, (_, index) => (
                  <div key={`empty-${index}`} />
                ))}

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

                  const isSelected = selectedDate === date;

                  // 今日の日付かどうかを判定
                  const today = new Date();

                  const isToday =
                    today.getFullYear() === year &&
                    today.getMonth() === month &&
                    today.getDate() === day;

                  const weekday = new Date(year, month, day).getDay();

                  return (
                    <button
                      key={day}
                      type="button"
                      aria-label={`${year}年${month + 1}月${day}日${hasEvent ? "、予定あり" : ""}${isToday ? "、今日" : ""}`}
                      onClick={() => setSelectedDate(date)}
                      style={{
                        ...styles.dayButton,

                        // 今日または選択した日は青色
                        background:
                          isSelected || isToday
                            ? "#c46b70"
                            : hasEvent
                              ? "#dbeafe"
                              : "transparent",

                        // 青い背景の日は白文字
                        color:
                          isSelected || isToday
                            ? "white"
                            : weekday === 0
                              ? "#dc2626"
                              : weekday === 6
                                ? "#2563eb"
                                : "#334155",

                        // 今日の日付には青い枠も付ける
                        border:
                          isSelected || isToday
                            ? "1px solid #c46b70"
                            : "1px solid transparent",

                        fontWeight:
                          hasEvent || isSelected || isToday
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {day}
                      {hasEvent && !isSelected && !isToday ? " •" : ""}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section style={styles.details}>
          <h2 style={{ fontSize: "20px", marginTop: 0 }}>
            {selectedDate
              ? `${selectedDate.replaceAll("-", "/")} の予定`
              : "予定の詳細"}
          </h2>

          {!selectedDate && (
            <p style={{ color: "#64748b" }}>
              カレンダーの日付をクリックすると、予定を確認できます。
            </p>
          )}

          {selectedDate && selectedEvents.length === 0 && (
            <p style={{ color: "#64748b" }}>
              この日に予定はありません。
            </p>
          )}

          {selectedEvents.map((event, index) => (
            <div
              key={`${event.date}-${event.title}-${index}`}
              style={{
                padding: "14px 0",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <h3 style={{ margin: "0 0 12px", fontSize: "18px" }}>
                {event.title}
              </h3>
              <p>時間：{event.time}</p>
              <p>場所：{event.place}</p>
              <p style={{ lineHeight: 1.7 }}>{event.description}</p>
            </div>
          ))}
        </section>

        <p style={{ fontSize: "13px", color: "#64748b", marginTop: "16px" }}>
          <span style={{ color: "#1d4ed8" }}>■</span> 今日の日付・選択中　
          <span style={{ color: "#dbeafe" }}>■</span> 予定がある日　
          <span style={{ color: "#94a3b8" }}>□</span> 通常の日
        </p>
      </div>
    </main>
  );
}