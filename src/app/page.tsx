import Image from "next/image";

export default function Home() {
  return (
    <div>
      <header className="header">
        <div className="header-inner">
          <h1>CIT LINK</h1>
          <p>認知情報科学科 学年横断掲示板</p>
        </div>
      </header>

      <main className="main">
        <section className="welcome">
          <h2>学生同士をつなぐ掲示板</h2>
          <p>
            質問・アンケート・実験協力・研究紹介など、
            学生同士で情報を共有できます。
          </p>
        </section>

        <section className="categories">
          <h2>カテゴリから探す</h2>

          <div className="category-list">
            <button>質問・相談</button>
            <button>アンケート</button>
            <button>実験協力</button>
            <button>メンバー募集</button>
            <button>研究紹介</button>
            <button>イベント</button>
          </div>
        </section>

        <section className="posts">
          <div className="posts-header">
            <h2>新着投稿</h2>
            <button className="post-button">＋ 投稿する</button>
          </div>

          <article className="post-card">
            <span className="category">質問・相談</span>
            <h3>おすすめの授業について教えてください</h3>
            <p>
              2年生の方で、おすすめの授業があれば教えてほしいです！
            </p>
            <div className="post-info">
              <span>1年生</span>
              <span>2026/10/05</span>
            </div>
          </article>

          <article className="post-card">
            <span className="category">実験協力</span>
            <h3>認知実験の参加者を募集しています</h3>
            <p>
              30分程度の実験に協力していただける方を募集しています。
            </p>
            <div className="post-info">
              <span>3年生</span>
              <span>2026/10/05</span>
            </div>
          </article>

          <article className="post-card">
            <span className="category">アンケート</span>
            <h3>授業に関するアンケートへの協力お願いします</h3>
            <p>
              授業改善のためのアンケートを実施しています。
            </p>
            <div className="post-info">
              <span>2年生</span>
              <span>2026/10/04</span>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
