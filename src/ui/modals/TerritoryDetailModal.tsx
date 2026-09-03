import React from 'react';
import { 
  Snowflake, 
  Feather, 
  Waves, 
  Flame, 
  Landmark, 
  X, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Shield 
} from 'lucide-react';

export interface TerritoryData {
  id: 'ARCTIC' | 'SKY' | 'OCEAN' | 'VOLCANIC' | 'THAI';
  title: string;
  thaiTitle: string;
  subject: string;
  status: 'ACTIVE' | 'LOCKED';
  themePalette: string;
  bgColor: string;
  textColor: string;
  accentBorder: string;
  icon: any;
  lore: string;
  features: string[];
  bannerGradient: string;
}

export const TERRITORY_LIST: Record<string, TerritoryData> = {
  ARCTIC: {
    id: 'ARCTIC',
    title: 'ARCTIC WORLD',
    thaiTitle: 'ดินแดนเหมันต์แห่งปัญญา',
    subject: 'คณิตศาสตร์ (Mathematics) • 710 ข้อมาตรฐาน สพฐ. / O-NET',
    status: 'ACTIVE',
    themePalette: 'White + Ice Blue + Deep Navy (ขาวประกายหิมะ & ฟ้าไอซ์บลู)',
    bgColor: 'from-sky-100 via-blue-50 to-white text-slate-900',
    textColor: 'text-sky-950',
    accentBorder: 'border-cyan-400',
    icon: Snowflake,
    lore: 'ดินแดนแห่งธารน้ำแข็งนิรันดร์และผลึกคริสตัลตรรกะศาสตร์ ที่ซึ่งผู้กล้าต้องฝึกฝนการคิดเลขเร็ว เศษส่วน สมการ และเรขาคณิต เพื่อฝ่าฟัน 6 เสาหลักโดโจและพิชิต 3 มหาบอสสู่ประตูโรงเรียน ม.1 ในฝัน',
    features: [
      '180 ข้อสอบเสาหลักโดโจ 6 มิติ (D1 - D6)',
      '120 ข้อสปีดรันศาลเจ้าความเร็วออโรร่า (F1 - F4)',
      '80 ข้อสอบมาตรฐาน O-NET & ข้อสอบเข้า ม.1 ยอดฮิต',
      '180 ข้อสอบจำลองสนามจริง จุฬาภรณฯ / สาธิตฯ / สสวท.',
      '40 ข้อสอบใหญ่ Grandmaster Final Trial (60 นาที)',
      'ระบบติวเข้ม 7 สเต็ป & ซ่อมแซมจุดอ่อน 1-Click Recovery Drill'
    ],
    bannerGradient: 'from-cyan-600 via-sky-500 to-blue-700',
  },
  SKY: {
    id: 'SKY',
    title: 'SKY CASTLE',
    thaiTitle: 'ปราการเวหาแห่งอารยธรรม',
    subject: 'สังคมศึกษา ศาสนา และวัฒนธรรม (Social Studies)',
    status: 'LOCKED',
    themePalette: 'White + Gold + Blue (ขาวพิสุทธิ์ & ทองคำเวหา)',
    bgColor: 'from-amber-50 via-sky-50 to-white text-slate-900',
    textColor: 'text-amber-950',
    accentBorder: 'border-amber-400',
    icon: Feather,
    lore: 'เกาะลอยฟ้าและวิหารแห่งแสงสุริยัน ศูนย์กลางการเรียนรู้ประวัติศาสตร์ ภูมิศาสตร์ หน้าที่พลเมือง และเศรษฐศาสตร์ เพื่อสร้างพลเมืองโลกที่มีวิจารณญาณ',
    features: [
      'การเดินทางข้ามกาลเวลาประวัติศาสตร์ไทยและสากล',
      'ผังภูมิศาสตร์กายภาพและแผนที่โลกดิจิทัล',
      'แบบจำลองการบริหารเศรษฐกิจชุมชนและการเงินสำหรับเด็ก',
      'กฎหมายพื้นฐานและสิทธิพลเมืองในระบอบประชาธิปไตย'
    ],
    bannerGradient: 'from-amber-500 via-yellow-400 to-sky-600',
  },
  OCEAN: {
    id: 'OCEAN',
    title: 'BUBBLE OCEAN LAND',
    thaiTitle: 'มหาสมุทรแห่งภาษาและคำศัพท์',
    subject: 'ภาษาต่างประเทศ (English Language)',
    status: 'LOCKED',
    themePalette: 'Blue + Aqua Marine (ฟ้าคราม & อความารีนใต้สมุทร)',
    bgColor: 'from-cyan-50 via-blue-50 to-white text-slate-900',
    textColor: 'text-cyan-950',
    accentBorder: 'border-cyan-400',
    icon: Waves,
    lore: 'นครใต้บาดาลเรืองแสงและแนวปะการังคำศัพท์ ที่ฝึกฝนทักษะไวยากรณ์ การอ่านจับใจความ (Reading Comprehension) และบทสนทนาสถานการณ์จริง',
    features: [
      'คลังคำศัพท์ Oxford 3,000 คำพื้นฐานสำหรับระดับ ป.6 - ม.1',
      'เขาวงกตไวยากรณ์ Tenses, Clauses & Prepositions',
      'การอ่านบทความวิทยาศาสตร์และข่าวสารภาษาอังกฤษสากล',
      'Speed Vocab Duel ประลองคำศัพท์จับเวลา'
    ],
    bannerGradient: 'from-blue-600 via-cyan-500 to-teal-500',
  },
  VOLCANIC: {
    id: 'VOLCANIC',
    title: 'VOLCANIC EARTH',
    thaiTitle: 'เตาหลอมวิทยาศิวะ',
    subject: 'วิทยาศาสตร์และเทคโนโลยี (Science & Technology)',
    status: 'LOCKED',
    themePalette: 'Ruby Red + Obsidian Black (แดงเพลิง & ดำออบซิเดียน)',
    bgColor: 'from-rose-50 via-amber-50 to-white text-slate-900',
    textColor: 'text-rose-950',
    accentBorder: 'border-rose-500',
    icon: Flame,
    lore: 'ภูเขาไฟแห่งการทดลองและเตาหลอมพันธะเคมี แหล่งฝึกฝนกระบวนการทางวิทยาศาสตร์ ฟิสิกส์ ชีววิทยา ดาราศาสตร์ และการแก้ปัญหาอย่างมีเหตุผล',
    features: [
      'ห้องทดลองจำลองเคมีและแรงในชีวิตประจำวัน',
      'ระบบนิเวศ สิ่งแวดล้อม และกลไกสิ่งมีชีวิต',
      'การสำรวจอวกาศ ดาราศาสตร์ และปรากฏการณ์ธรรมชาติ',
      'ข้อสอบคิดวิเคราะห์แนว สสวท. และ IJSO ระดับต้น'
    ],
    bannerGradient: 'from-rose-600 via-red-500 to-amber-600',
  },
  THAI: {
    id: 'THAI',
    title: 'LEGENDARY FOREST',
    thaiTitle: 'แดนวรรณคดีและหลักภาษาไทย',
    subject: 'ภาษาไทย (Thai Language & Literature)',
    status: 'LOCKED',
    themePalette: 'Emerald Green + Gold (เขียวมรกต & ทองคำโบราณ)',
    bgColor: 'from-emerald-50 via-amber-50 to-white text-slate-900',
    textColor: 'text-emerald-950',
    accentBorder: 'border-emerald-500',
    icon: Landmark,
    lore: 'ปราสาทไม้สักทองและสวนบัวสวรรค์แห่งวรรณศิลป์ ฝึกฝนการสะกดคำ การแต่งประโยค คำราชาศัพท์ วรรณคดี และการอ่านจับใจความสำคัญ',
    features: [
      'คลังคำศัพท์และหลักการสะกดคำยากที่มักออกสอบ',
      'การถอดความบทประพันธ์และวิเคราะห์คุณค่าทางวรรณคดี',
      'การอ่านจับใจความและเขียนสรุปความอย่างเป็นระบบ',
      'ข้อสอบคัดเลือกเข้า ม.1 โรงเรียนแข่งขันสูง'
    ],
    bannerGradient: 'from-emerald-600 via-teal-500 to-amber-500',
  },
};

interface TerritoryDetailModalProps {
  territoryKey: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEnterArctic: () => void;
}

export const TerritoryDetailModal: React.FC<TerritoryDetailModalProps> = ({
  territoryKey,
  isOpen,
  onClose,
  onEnterArctic,
}) => {
  if (!isOpen || !territoryKey) return null;

  const territory = TERRITORY_LIST[territoryKey] || TERRITORY_LIST.ARCTIC;
  const Icon = territory.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in select-none">
      <div className="bg-slate-950 border-2 border-amber-400/80 rounded-3xl max-w-2xl w-full overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.35)] flex flex-col max-h-[90vh]">
        
        {/* Header Visual Banner */}
        <div className={`p-6 bg-gradient-to-r ${territory.bannerGradient} text-white relative overflow-hidden`}>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-serif font-black tracking-wide">{territory.title}</span>
                  {territory.status === 'ACTIVE' ? (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cyan-300 text-slate-950 shadow-md">
                      ACTIVE IN PRODUCTION
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-amber-200 border border-amber-300/40 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> COMING SOON
                    </span>
                  )}
                </div>
                <h2 className="text-base font-black text-amber-200 mt-0.5">{territory.thaiTitle}</h2>
                <p className="text-xs text-cyan-100 font-medium">{territory.subject}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Palette Tag */}
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-white/90">
            <span>🎨 โทนสีประจำแดน: <strong>{territory.themePalette}</strong></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-200">
          
          {/* Lore / Overview */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> เรื่องราวประจำดินแดน (Territory Lore)
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">{territory.lore}</p>
          </div>

          {/* Key Features */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" /> จุดเด่นและเนื้อหาหลักสูตร
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {territory.features.map((feat, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
          >
            ปิดหน้าต่าง
          </button>

          {territory.status === 'ACTIVE' ? (
            <button
              onClick={() => {
                onClose();
                onEnterArctic();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 text-xs font-black shadow-glow-cyan flex items-center gap-2 transform hover:scale-105 transition-all"
            >
              <span>เข้าสู่ดินแดนคณิตศาสตร์ (Enter Arctic Math)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-xs text-amber-400/80 font-bold flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5" /> เตรียมเปิดให้ผจญภัยในอัปเดตถัดไป
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
