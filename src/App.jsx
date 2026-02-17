// src/App.jsx
import React, { useState, useEffect } from "react";
import { 
  Heart, Search, User, Bell, PlusCircle, ArrowLeft, 
  CheckCircle, Play, MessageCircle, Star, ShieldCheck, TrendingUp, LogOut, Loader2 
} from "lucide-react";
import { supabase } from './supabaseClient'; // Supabaseクライアントをインポート

/* BUSINESS MODEL: 
  - Talent Subscription: ¥3,000 ~ ¥10,000/month
  - Matching: Direct contract supported by Escrow
*/

// グローバルなSupabaseクライアント
// (実際のアプリではProviderなどで渡すのが一般的ですが、今回は簡易化)
// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_ANON_KEY
// );

export default function TalentMarketplace() {
  const [session, setSession] = useState(null);
  const [page, setPage] = useState("list"); // list, detail, dashboard, auth, profile_edit
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // タレント一覧を読み込む
    const fetchTalents = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_verified', true); // 検証済みのタレントのみ表示
      if (error) console.error("Error fetching talents:", error);
      else setTalents(data);
    };

    // ログインユーザーのプロフィールを読み込む
    const fetchUserProfile = async () => {
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (error && error.code !== 'PGRST116') { // PGRST116はレコードがない場合
          console.error("Error fetching user profile:", error);
        } else if (data) {
          setUserProfile(data);
        } else {
          // プロフィールがない場合は作成を促す
          setUserProfile({ id: session.user.id, full_name: '', category: '', bio: '', avatar_url: '', subscription_plan: 'free', is_verified: false });
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchTalents();
    fetchUserProfile();
  }, [session, page]); // sessionまたはpageが変わったら再取得

  /* ------------------ UI COMPONENTS ------------------ */

  const Header = ({ showBack, currentTitle }) => (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => setPage("list")} />}
          <h1 className="text-xl font-extrabold tracking-tighter text-red-600">
            {currentTitle || "TALENT MATCH"}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <Search className="w-5 h-5" />
          <Bell className="w-5 h-5" />
          {session ? (
            <User className="w-5 h-5 cursor-pointer" onClick={() => setPage("dashboard")} />
          ) : (
            <button 
              onClick={() => setPage("auth")} 
              className="text-xs font-bold px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              ログイン
            </button>
          )}
        </div>
      </div>
    </header>
  );

  const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleAuth = async (e) => {
      e.preventDefault();
      setAuthLoading(true);
      setMessage('');

      try {
        if (isLogin) {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          setMessage('ログインしました！');
          setPage('list');
        } else {
          const { error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          setMessage('登録メールを送信しました。メールをご確認ください。');
          // 新規登録後、プロフィール作成画面へ遷移させることも可能
          setPage('list'); // 登録後すぐはセッションがないため一旦リストへ
        }
      } catch (error) {
        setMessage(error.message);
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
        <Header showBack currentTitle={isLogin ? "ログイン" : "新規登録"} />
        <main className="flex-grow flex items-center justify-center p-4">
          <form onSubmit={handleAuth} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">{isLogin ? "ログイン" : "新規登録"}</h2>
            {message && <p className="text-sm text-center text-red-500">{message}</p>}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                placeholder="******"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              disabled={authLoading}
            >
              {authLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLogin ? "ログイン" : "登録"}
            </button>
            <p className="text-center text-sm text-gray-600">
              {isLogin ? "アカウントをお持ちでないですか？" : "すでにアカウントをお持ちですか？"}
              <span 
                className="text-red-600 font-bold ml-1 cursor-pointer hover:underline"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "新規登録" : "ログイン"}
              </span>
            </p>
          </form>
        </main>
      </div>
    );
  };

  const ProfileEdit = () => {
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    const [formState, setFormState] = useState({
      full_name: userProfile?.full_name || '',
      category: userProfile?.category || '',
      price_per_project: userProfile?.price_per_project || '',
      bio: userProfile?.bio || '',
      avatar_url: userProfile?.avatar_url || '',
      subscription_plan: userProfile?.subscription_plan || 'free',
      is_verified: userProfile?.is_verified || false
    });

    useEffect(() => {
      // userProfileがロードされたらフォームにセット
      if (userProfile) {
        setFormState({
          full_name: userProfile.full_name || '',
          category: userProfile.category || '',
          price_per_project: userProfile.price_per_project || '',
          bio: userProfile.bio || '',
          avatar_url: userProfile.avatar_url || '',
          subscription_plan: userProfile.subscription_plan || 'free',
          is_verified: userProfile.is_verified || false
        });
      }
    }, [userProfile]);


    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setProfileLoading(true);
      setProfileMessage('');

      try {
        const updates = {
          id: session.user.id,
          full_name: formState.full_name,
          category: formState.category,
          price_per_project: parseInt(formState.price_per_project) || 0,
          bio: formState.bio,
          avatar_url: formState.avatar_url,
          subscription_plan: formState.subscription_plan,
          is_verified: formState.is_verified,
          updated_at: new Date(),
        };

        const { error } = await supabase
          .from('profiles')
          .upsert(updates, { onConflict: 'id' }); // idがあれば更新、なければ挿入

        if (error) throw error;
        setProfileMessage('プロフィールを更新しました！');
        setPage('dashboard'); // ダッシュボードに戻る
      } catch (error) {
        setProfileMessage(`エラー: ${error.message}`);
      } finally {
        setProfileLoading(false);
      }
    };

    if (!userProfile) return <div className="text-center p-8">プロフィールを読み込み中...</div>;

    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
        <Header showBack currentTitle="プロフィール編集" />
        <main className="flex-grow p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">プロフィール編集</h2>
            {profileMessage && <p className="text-sm text-center text-red-500">{profileMessage}</p>}
            
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">氏名 / 芸名</label>
              <input type="text" id="full_name" name="full_name" value={formState.full_name} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" required />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">得意なジャンル</label>
              <select id="category" name="category" value={formState.category} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" required>
                <option value="">選択してください</option>
                <option value="ナレーター・声優">ナレーター・声優</option>
                <option value="ファッションモデル">ファッションモデル</option>
                <option value="インフルエンサー">インフルエンサー</option>
                <option value="俳優">俳優</option>
                <option value="MC">MC</option>
              </select>
            </div>
            <div>
              <label htmlFor="price_per_project" className="block text-sm font-medium text-gray-700 mb-1">プロジェクト単価 (目安)</label>
              <input type="number" id="price_per_project" name="price_per_project" value={formState.price_per_project} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">自己紹介 / スキル詳細</label>
              <textarea id="bio" name="bio" value={formState.bio} onChange={handleChange} rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" required></textarea>
            </div>
            <div>
              <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-1">プロフィール画像URL (現時点ではURLを直接入力)</label>
              <input type="url" id="avatar_url" name="avatar_url" value={formState.avatar_url} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              disabled={profileLoading}
            >
              {profileLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              プロフィールを更新
            </button>
          </form>
        </main>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  /* ------------------ PAGES ------------------ */

  if (page === "auth") {
    return <Auth />;
  }

  if (page === "profile_edit") {
    return <ProfileEdit />;
  }

  if (page === "list") {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Header currentTitle="人気のタレント" />
        
        {/* Category Tabs */}
        <div className="bg-white border-b border-gray-100 overflow-x-auto flex gap-6 px-6 py-3 no-scrollbar">
          {["すべて", "声優", "モデル", "俳優", "インフルエンサー", "MC"].map(cat => (
            <span key={cat} className="text-sm font-medium text-gray-600 whitespace-nowrap cursor-pointer hover:text-red-500 transition-colors">
              {cat}
            </span>
          ))}
        </div>

        <main className="max-w-5xl mx-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-6 mt-2">
          {talents.length === 0 && !loading && (
            <p className="col-span-full text-center text-gray-500 py-8">
              まだタレントが登録されていません。
              {session && !userProfile?.full_name && (
                 <span className="block mt-2 text-red-600 cursor-pointer" onClick={() => setPage('profile_edit')}>
                   あなたのプロフィールを登録しませんか？
                 </span>
              )}
            </p>
          )}
          {talents.map((t) => (
            <div 
              key={t.id} 
              onClick={() => { setSelectedTalent(t); setPage("detail"); }}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={t.avatar_url || "https://via.placeholder.com/400x500.png?text=No+Image"} alt={t.full_name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-[10px] font-bold">5.0</span> {/* 仮の評価 */}
                </div>
                {t.is_verified && (
                  <div className="absolute bottom-2 left-2">
                    <ShieldCheck className="w-6 h-6 text-blue-500 fill-white" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{t.category}</p>
                <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">{t.full_name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-sm font-bold text-red-500">¥</span>
                  <span className="text-lg font-black text-red-500">{(t.price_per_project || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 font-medium">〜 / 件</span>
                </div>
              </div>
            </div>
          ))}
        </main>

        <button 
          onClick={() => session ? setPage("profile_edit") : setPage("auth")} // ログインしていればプロフィール編集、そうでなければログイン画面へ
          className="fixed bottom-8 right-8 bg-red-600 text-white flex items-center gap-2 px-6 py-4 rounded-full shadow-2xl hover:bg-red-700 transition-all active:scale-95 z-50"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="font-bold">{session ? "プロフィール編集" : "出品者になる"}</span>
        </button>
      </div>
    );
  }

  if (page === "detail") {
    // 選択されたタレントのデータを`selectedTalent`から表示
    // (ここでは仮のタグを表示。実際のデータはprofilesテーブルにtagカラムを追加して管理)
    const dummyTags = ["宅録可", "即日納品", "都内限定"];
    return (
      <div className="min-h-screen bg-white pb-24">
        <Header showBack currentTitle={selectedTalent.full_name} />
        <div className="max-w-2xl mx-auto">
          <img src={selectedTalent.avatar_url || "https://via.placeholder.com/800x800.png?text=No+Image"} className="w-full aspect-square object-cover" />
          
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-gray-900">{selectedTalent.full_name}</h2>
                <p className="text-gray-500 font-medium">{selectedTalent.category}</p>
              </div>
              <Heart className="w-7 h-7 text-gray-300 hover:text-red-500 cursor-pointer" />
            </div>

            <div className="flex gap-2 mt-4">
              {dummyTags.map(tag => ( // 現時点ではダミー
                <span key={tag} className="text-[10px] bg-gray-100 px-2 py-1 rounded-md font-bold text-gray-600">#{tag}</span>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="font-bold border-l-4 border-red-500 pl-3 mb-3">自己紹介 / スキル</h4>
              <p className="text-gray-600 leading-relaxed">{selectedTalent.bio}</p>
            </div>

            <div className="mt-8 bg-red-50 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-3 rounded-full text-white">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <span className="font-bold text-red-900 text-sm">サンプルボイスを聞く</span>
              </div>
              <span className="text-xs text-red-400 font-bold">0:45</span>
            </div>
          </div>
        </div>

        {/* Purchase Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold uppercase">依頼料金</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-red-600">¥{(selectedTalent.price_per_project || 0).toLocaleString()}</span>
              <span className="text-xs text-gray-400">〜</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              相談
            </button>
            <button className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-200">
              依頼する
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (page === "dashboard") {
    const handleLogout = async () => {
      setLoading(true);
      await supabase.auth.signOut();
      setPage("list");
    };

    if (!userProfile) return <div className="text-center p-8">プロフィールを読み込み中...</div>;

    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Header showBack currentTitle="マイページ" />
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={userProfile.avatar_url || "https://via.placeholder.com/80.png?text=No+Image"} 
                alt={userProfile.full_name} 
                className="w-20 h-20 rounded-full object-cover border-4 border-white"
              />
              <div>
                <h2 className="text-2xl font-black">{userProfile.full_name || "名無しタレント"}</h2>
                <p className="text-gray-400 text-sm">{userProfile.category || "未設定"}</p>
                {userProfile.is_verified && (
                  <span className="inline-flex items-center gap-1 text-green-400 text-xs font-bold mt-1">
                    <CheckCircle className="w-4 h-4 fill-green-400 text-white" /> 本人確認済み
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-start mb-8 border-t border-white/10 pt-6 mt-6">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{userProfile.subscription_plan} Plan</p>
                <h2 className="text-3xl font-black mt-1">¥142,500</h2> {/* 仮の売上 */}
                <p className="text-sm text-gray-400 mt-1">今月の売上見込み</p>
              </div>
              <TrendingUp className="text-green-400" />
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">取引中</p>
                <p className="text-lg font-bold">12件</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">総合評価</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  4.9 <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="font-bold text-gray-900">クイックメニュー</h3>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setPage('profile_edit')}
                className="bg-white p-4 rounded-2xl border border-gray-100 font-bold text-sm text-gray-700 shadow-sm cursor-pointer hover:border-red-200"
              >
                プロフィール編集
              </div>
              {["振込申請", "月額プラン変更", "本人確認書類"].map(item => (
                <div key={item} className="bg-white p-4 rounded-2xl border border-gray-100 font-bold text-sm text-gray-700 shadow-sm cursor-pointer hover:border-red-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={handleLogout}
              className="text-red-600 font-bold flex items-center gap-2 mx-auto hover:underline"
            >
              <LogOut className="w-5 h-5" />
              ログアウト
            </button>
          </div>
        </div>
      </div>
    );
  }
}
