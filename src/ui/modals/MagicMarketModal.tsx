import React, { useState } from 'react';
import { PlayerProfile } from '../../types';
import { MAGIC_MARKET_ITEMS, purchaseMarketItem } from '../../progression/market-database';
import { ConsumableItemId } from '../../types/learning';
import { Coins, Sparkles, X, CheckCircle2, ShoppingBag, ShieldAlert } from 'lucide-react';

interface MagicMarketModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (newProfile: PlayerProfile) => Promise<void>;
  onClose: () => void;
}

export const MagicMarketModal: React.FC<MagicMarketModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  const items = Object.values(MAGIC_MARKET_ITEMS);

  const handleBuy = async (itemId: ConsumableItemId) => {
    const res = purchaseMarketItem(profile, itemId, 1);
    setIsSuccess(res.success);
    setPurchaseMessage(res.message);
    if (res.success) {
      await onUpdateProfile(res.updatedProfile);
    }
    setTimeout(() => {
      setPurchaseMessage(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 select-none font-sans">
      <div className="frost-card rounded-3xl p-5 md:p-7 max-w-2xl w-full border-2 border-amber-400 shadow-glow-gold text-slate-100 max-h-[92vh] flex flex-col justify-between overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-400 flex items-center justify-center text-3xl shadow-glow-gold">
                🏪
              </div>
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                  MAGIC MARKET (ตลาดเวทมนตร์)
                </span>
                <h3 className="text-base md:text-lg font-black text-white">
                  ร้านค้าไอเทมเวทมนตร์เสริมการฝึกซ้อม
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-md">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{profile.coins.toLocaleString()} 🪙</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Practice Protection Alert */}
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 my-3 flex items-center gap-2 text-xs text-cyan-200">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              ไอเทมทั้งหมดใช้ได้เฉพาะใน <strong>โหมดฝึกซ้อม, โดโจ, และสปีดรัน</strong> เท่านั้น (โหมดสอบจริง O-NET / Final Trial ปิดการช่วยเหลืออัตโนมัติ)
            </span>
          </div>

          {/* Purchase Notification Banner */}
          {purchaseMessage && (
            <div className={`p-2.5 rounded-xl text-xs font-bold mb-3 flex items-center gap-2 ${
              isSuccess ? 'bg-emerald-950 border border-emerald-400 text-emerald-300' : 'bg-rose-950 border border-rose-400 text-rose-300'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{purchaseMessage}</span>
            </div>
          )}

          {/* Item Bag Quick Bar */}
          <div className="p-3 rounded-2xl bg-arctic-950/80 border border-slate-800 mb-3 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> กระเป๋าไอเทมของคุณ:
            </span>
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-purple-300 border border-purple-500/30">
                🔮 คำใบ้: {profile.consumableInventory?.MAGIC_HINT || 0}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-amber-500/30">
                ✂️ 50:50: {profile.consumableInventory?.FIFTY_FIFTY_RUNE || 0}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-cyan-500/30">
                ⏳ เวลา: {profile.consumableInventory?.TIME_POTION || 0}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-300 border border-emerald-500/30">
                🛡️ โล่: {profile.consumableInventory?.AEGIS_SHIELD || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Item Catalog */}
        <div className="overflow-y-auto space-y-2.5 pr-1 max-h-[48vh] my-1">
          {items.map((item) => {
            const owned = profile.consumableInventory?.[item.id] || 0;
            const canAfford = profile.coins >= item.coinPrice;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-arctic-900/90 border border-slate-700/80 hover:border-amber-400/60 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-arctic-950 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white">{item.thaiName}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        (มีอยู่: {owned})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                    <span className="text-[10px] text-cyan-400 font-bold">
                      ⚡ {item.effectDescription}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(item.id)}
                  disabled={!canAfford}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 shadow-md ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 shadow-glow-gold transform hover:scale-105'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{item.coinPrice} 🪙 ซื้อ</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>* เหรียญทองได้จากการตอบข้อสอบถูกต้องในทุกโซน</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            ปิดตลาดเวทมนตร์
          </button>
        </div>
      </div>
    </div>
  );
};
