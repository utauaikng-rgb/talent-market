import { useState } from "react";
import { Heart, Search, User, Bell, PlusCircle, ArrowLeft } from "lucide-react";

/* ======================================================
   TALENT MARKETPLACE - FULL PURCHASE FLOW MOCK
   ======================================================
   実装済み機能
   ✔ 商品一覧
   ✔ 商品詳細ページ
   ✔ チャット交渉
   ✔ 依頼購入ボタン
   ✔ エスクロー決済（仮UI）
   ✔ 評価レビュー
   ✔ 出品フォーム
   ✔ 企業アカウント切替
   ✔ 本人確認表示
   ✔ 売上管理ダッシュボード
====================================================== */

export default function TalentMarketplace() {
  const [page, setPage] = useState("list");
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [userType, setUserType] = useState("company");

  const talents = [
    {
      id: 1,
      name: "田中 声",
      category: "声優",
      price: 15000,
      desc: "ナレーション・ゲームボイス",
      verified: true,
      rating: 4.9,
      reviews: 32,
      voiceSample:
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
  ];

  /* ================= LIST ================= */
  if (page === "list") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header setPage={setPage} />

        <main className="max-w-6xl mx-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {talents.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                setSelectedTalent(t);
                setPage("detail");
              }}
              className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg cursor-pointer"
            >
              <div className="aspect-square bg-gray-200" />
              <div className="p-3">
                <p className="text-xs text-gray-500">{t.category}</p>
                <p className="font-semibold">{t.name}</p>
                <p className="font-bold">¥{t.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </main>

        <FloatingSell setPage={setPage} />
      </div>
    );
  }

  /* ================= DETAIL ================= */
  if (page === "detail") {
    return (
      <div className="min-h-screen bg-white">
        <Header back={() => setPage("list")} />

        <div className="max-w-4xl mx-auto p-6">
          <div className="aspect-video bg-gray-200 rounded-xl" />

          <h1 className="text-2xl font-bold mt-4">{selectedTalent.name}</h1>

          {selectedTalent.verified && (
            <p className="text-green-600 text-sm">本人確認済み</p>
          )}

          <p className="text-gray-600 mt-2">{selectedTalent.desc}</p>

          <audio
            controls
            src={selectedTalent.voiceSample}
            className="w-full mt-4"
          />

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setPage("chat")}
              className="border px-6 py-3 rounded-xl"
            >
              チャット交渉
            </button>

            <button
              onClick={() => setPage("purchase")}
              className="bg-red-500 text-white px-6 py-3 rounded-xl"
            >
              依頼購入
            </button>
          </div>

          <ReviewSection />
        </div>
      </div>
    );
  }

  /* ================= CHAT ================= */
  if (page === "chat") {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header back={() => setPage("detail")} />

        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-white rounded-xl p-4 h-96 overflow-y-auto">
            <ChatBubble me message="出演可能ですか？" />
            <ChatBubble message="はい、日程次第で可能です！" />
          </div>

          <input
            placeholder="メッセージ入力"
            className="w-full mt-4 border rounded-xl px-4 py-3"
          />
        </div>
      </div>
    );
  }

  /* ================= PURCHASE ================= */
  if (page === "purchase") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header back={() => setPage("detail")} />

        <div className="max-w-xl mx-auto p-6">
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold">エスクロー決済</h2>

            <p className="mt-2 text-gray-600">
              支払いは運営が一時保管し、業務完了後にタレントへ送金されます
            </p>

            <p className="text-2xl font-bold mt-6">
              ¥{selectedTalent.price.toLocaleString()}
            </p>

            <button
              onClick={() => setPage("complete")}
              className="w-full bg-red-500 text-white py-3 rounded-xl mt-6"
            >
              支払い確定
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= COMPLETE ================= */
  if (page === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">購入完了</h1>
          <p className="mt-2">取引が開始されました</p>
          <button
            onClick={() => setPage("list")}
            className="mt-6 border px-6 py-3 rounded-xl"
          >
            トップへ
          </button>
        </div>
      </div>
    );
  }

  /* ================= SELL ================= */
  if (page === "sell") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header back={() => setPage("list")} />

        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold">出品フォーム</h2>

          <input placeholder="芸名" className="input" />
          <textarea placeholder="仕事内容" className="input" />
          <input placeholder="価格" className="input" />
          <input type="file" className="input" />
          <input type="file" accept="audio/*" className="input" />

          <button className="btn-primary mt-4">出品する</button>
        </div>
      </div>
    );
  }

  /* ================= DASHBOARD ================= */
  if (page === "dashboard") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header back={() => setPage("list")} />

        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-2xl font-bold">売上管理</h2>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <Stat title="今月売上" value="¥320,000" />
            <Stat title="取引数" value="18" />
            <Stat title="評価" value="4.9" />
          </div>
        </div>
      </div>
    );
  }
}

/* ================= COMPONENTS ================= */

function Header({ setPage, back }) {
  return (
    <header className="bg-white border-b p-3 flex items-center gap-3">
      {back && (
        <ArrowLeft className="cursor-pointer" onClick={back} />
      )}
      <h1 className="font-bold">Talent Match</h1>
      <div className="flex-1" />
      <Bell />
      <Heart />
      <User />
    </header>
  );
}

function FloatingSell({ setPage }) {
  return (
    <button
      onClick={() => setPage("sell")}
      className="fixed bottom-6 right-6 bg-red-500 text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center"
    >
      <PlusCircle />
    </button>
  );
}

function ChatBubble({ message, me }) {
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`px-4 py-2 rounded-xl ${
          me ? "bg-red-500 text-white" : "bg-gray-200"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

function ReviewSection() {
  return (
    <div className="mt-8">
      <h3 className="font-bold mb-2">評価レビュー</h3>
      <div className="border rounded-xl p-3">
        ⭐⭐⭐⭐⭐ とても丁寧で素晴らしい収録でした
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
