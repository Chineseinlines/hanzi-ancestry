/**
 * English companion data for simpTradOrigins.ts (「把字溯源」 / "Trace the Character")
 *
 * Mirrors the curated Chinese data with academic-style English renderings.
 * Character glyphs (both simplified and traditional) are preserved verbatim;
 * book titles are romanized on first mention and given in translation where
 * an established English title exists.
 */
import type { SimpTradOriginType } from './simpTradOrigins';

/** English labels for the simplification-type categories */
export const ORIGIN_TYPE_LABELS_EN: Record<SimpTradOriginType, string> = {
  'ancient-variant': 'Ancient Variant',
  'cursive': 'Cursive Standardization',
  'symbol-substitution': 'Symbol Substitution',
  'omission': 'Structural Omission',
  'phonetic-replacement': 'Phonetic Replacement',
  'merger': 'Merged Characters',
  'analogy': 'Radical Analogy',
  'other': 'Modern Simplification',
};

/**
 * English notes keyed by the simplified character.
 * Covers all entries of ORIGIN_ENTRIES in simpTradOrigins.ts.
 */
export const EN_NOTES: Record<string, string> = {
  /* ── Ancient variants / popular forms: the simplified shape is attested
        in antiquity and is often older than the traditional form ── */
  '国': '國 is composed of 囗 (enclosure) and 或, the original graph of 域 ("territory") and an image of holding a spear to guard a city. The popular form 国 appears as early as Northern and Southern Dynasties stele inscriptions and Dunhuang manuscripts, and Taiping Heavenly Kingdom documents wrote it as 囯; the 1956 Hanzi Simplification Scheme adopted this ancient popular form as the standard character.',
  '从': 'The oracle bone script already contains 从 (two persons following one another), which long coexisted with 從; the Shuowen Jiezi records 从 as the ancient-script form of 從. The ancient graph 从 was adopted in 1956.',
  '电': '电 already occurs in bronze script; 電 is a later graph formed by adding the 雨 (rain) radical. The ancient graph 电 was restored in 1956.',
  '气': '气 already occurs in oracle bone script, depicting the shape of cloud vapor; 氣 originally meant to present grain and fodder (now written 饩) and was later borrowed for the sense "vapor." The original graph 气 was restored in 1956.',
  '云': 'In oracle bone script 云 depicts cloud vapor curling; the 雨 radical was later added to form 雲, distinguishing it from 云 in the sense "to say." The original graph 云 was restored in 1956.',
  '网': '网 is the original pictographic graph, already present in oracle bone script; the 糸 radical was later added to form 網. The original graph 网 was restored in 1956.',
  '万': 'As early as the pre-Qin period, 万 was used as a simplified variant of 萬 (attested in ancient pottery inscriptions). 万 was adopted in 1956.',
  '无': 'The "extraordinary character" 无 recorded in the Shuowen Jiezi already existed in pre-Qin times; 無 is a later phono-semantic compound. 无 was adopted in 1956.',
  '尔': '尔 is an ancient graph, attested in seal script, that serves as a simplified variant of 爾. 尔 was adopted in 1956.',
  '个': 'By the Han dynasty 个 was already used as a numeral classifier (the Shiji has 竹竿万个, "ten thousand bamboo poles"), coexisting with 個. 个 was adopted in 1956.',
  '与': '与 already occurs in bronze script and originally meant "to bestow"; the Shuowen Jiezi records 与 as the ancient-script form of 與. 与 was adopted in 1956.',
  '号': '号 is an ancient graph whose original meaning was to cry out or wail; 號 is a later phono-semantic compound. 号 was adopted in 1956.',
  '处': '処 is recorded in the Shuowen Jiezi as an alternative form, and 处 is a variant of it, already current in antiquity. 处 was adopted in 1956.',
  '礼': 'In oracle bone script 豊 depicts a ritual vessel; 礼 appears in seal script, while 禮 is a later phono-semantic compound. 礼 was adopted in 1956.',
  '时': '时 is a popular form (su zi) common from the Song and Yuan dynasties onward and is recorded in the Song Yuan Yilai Suzi Pu. The popular form 时 was adopted in 1956.',
  '达': '达 occurs in oracle bone and bronze script, and the Shuowen Jiezi records 达 as an alternative form of 達. 达 was adopted in 1956.',
  '灵': '灵 is a popular form common from the Yuan and Ming dynasties onward, a compound ideograph depicting hands holding fire in offering. The popular form 灵 was adopted in 1956.',
  '医': '医 is an ancient graph whose original meaning was a container for bows, crossbows, and arrows (recorded in the Shuowen Jiezi), while 醫 is the original graph for "physician." In 1956 the ancient graph 医 was borrowed to replace 醫.',
  '后': '后 originally meant "sovereign" (already present in oracle bone script), whereas 後 expressed the sense "after, later"; the two graphs coexisted in antiquity. In 1956 they were merged into the ancient graph 后.',

  /* ── Cursive standardization: regularized from cursive script forms ── */
  '书': '书 derives from the regularization (kaishu standardization) of the cursive script form of 書.',
  '为': '为 derives from the regularization of the cursive script form of 為.',
  '东': '东 derives from the regularization of the cursive script form of 東.',
  '乐': '乐 derives from the regularization of the cursive script form of 樂.',
  '头': '头 derives from the regularization of the cursive script form of 頭.',
  '长': '长 derives from the regularization of the cursive script form of 長 (approximate forms already appear in Han dynasty bamboo slips).',
  '车': '车 derives from the regularization of the cursive script form of 車.',
  '门': '门 derives from the regularization of the cursive script form of 門.',
  '马': '马 derives from the regularization of the cursive script form of 馬.',
  '鸟': '鸟 derives from the regularization of the cursive script form of 鳥.',
  '龙': '龙 derives from the regularization of the cursive script form of 龍.',
  '风': '风 derives from the regularization of the cursive script form of 風.',
  '飞': '飞 derives from the regularization of the cursive script form of 飛.',
  '贝': '贝 derives from the regularization of the cursive script form of 貝.',
  '页': '页 derives from the regularization of the cursive script form of 頁.',
  '见': '见 derives from the regularization of the cursive script form of 見.',
  '专': '专 derives from the regularization of the cursive script form of 專.',
  '学': '学 derives from the regularization of the cursive script form of 學.',
  '会': '会 derives from the regularization of the cursive script form of 會.',
  '觉': '觉 derives from the regularization of the cursive script form of 覺.',
  '兴': '兴 derives from the regularization of the cursive script form of 興.',
  '当': '当 derives from the regularization of the cursive script form of 當 (it also absorbs 噹).',
  '应': '应 derives from the regularization of the cursive script form of 應.',
  '农': '农 derives from the regularization of the cursive script form of 農.',
  '杀': '杀 derives from the regularization of the cursive script form of 殺.',

  /* ── Symbol substitution: simple symbols such as 又 or 乂 replace
        structurally complex components ── */
  '难': 'The symbol 又 replaces 堇.',
  '鸡': 'The symbol 又 replaces 奚.',
  '观': 'The symbol 又 replaces 雚.',
  '汉': 'The symbol 又 replaces 堇.',
  '欢': 'The symbol 又 replaces 雚.',
  '戏': 'The symbol 又 replaces part of 虍.',
  '对': 'The symbol 又 replaces the left-hand component.',
  '凤': '又 is placed at the center, replacing the inner structure.',
  '树': 'The symbol 又 replaces 壴.',
  '聂': '双 replaces the three stacked 耳 components.',
  '轰': '双 replaces the three stacked 車 components.',
  '赵': 'The symbol 乂 replaces 肖.',
  '区': 'The symbol 乂 replaces the inner 品-shaped component.',
  '冈': 'The symbol 乂 replaces the inner structure.',

  /* ── Structural omission: part of the structure is kept, the rest dropped ── */
  '声': 'The upper part of 聲 (the chime-stone shape) is retained, while 殳 and 耳 are omitted.',
  '际': '阝 and 示 are retained, while 祭 is omitted.',
  '灭': '一 is set over 火 to form a compound ideograph meaning "to extinguish fire," omitting 戌 and 氵.',
  '点': '占 and 灬 are retained, while 黑 is omitted.',
  '夺': 'The upper part is retained, while the middle component 佳 is omitted.',
  '寻': 'The upper part is retained, while the lower part is omitted.',
  '亲': 'The 亲 shape is retained, while 見 is omitted.',

  /* ── Phonetic replacement: a simpler homophonous phonetic is substituted ── */
  '洁': 'The phonetic 絜 is replaced by the homophonous 吉.',
  '虾': 'The phonetic 叚 is replaced by 下.',
  '苹': 'The phonetic 頻 is replaced by 平.',
  '亿': 'The phonetic 意 is replaced by 乙.',
  '忆': 'The phonetic 意 is replaced by 乙.',
  '拥': 'The phonetic 雍 is replaced by 用.',
  '优': 'The phonetic 憂 is replaced by 尤.',
  '邮': 'The phonetic 垂 is replaced by 由.',
  '认': 'The phonetic 忍 is replaced by 人.',
  '让': 'The phonetic 襄 is replaced by 上.',
  '战': 'The phonetic 單 is replaced by 占.',
  '远': 'The phonetic 袁 is replaced by 元.',
  '园': 'The phonetic 袁 is replaced by 元.',
  '种': 'The phonetic 重 is replaced by 中.',

  /* ── Merged characters: several traditional graphs collapse into one
        simplified graph ── */
  '发': '發 ("to send forth") and 髮 ("hair") were merged into 发.',
  '干': 'The original graph 干 ("shield") was merged with 乾 ("dry") and 幹 ("trunk; to do").',
  '里': '里 originally meant "village, neighborhood" (an ancient graph), while 裏 and 裡 originally meant "lining of a garment"; the two coexisted in antiquity and were merged into 里 in 1956.',
  '台': '臺 ("high terrace"), 檯 ("table, counter"), and 颱 ("typhoon") were merged into the ancient graph 台.',
  '系': '系 ("system"; an ancient graph) was merged with 係 and 繫.',
  '面': '面 ("face"; an ancient graph) was merged with 麵 ("flour, noodles").',
  '复': '復 ("to repeat, to return"), 複 ("complex, layered"), and 覆 ("to cover, to overturn") were merged into 复.',
  '斗': '斗 ("measuring vessel"; an ancient graph) was merged with 鬥 ("to fight").',
  '叶': 'The ancient graph 叶 (xié, "to rhyme") was borrowed to replace 葉 ("leaf").',
  '松': '松 ("pine tree") was merged with 鬆 ("loose, slack").',
  '谷': '谷 ("valley"; an ancient graph) was merged with 穀 ("grain").',
  '丑': '丑 ("an Earthly Branch"; an ancient graph) was merged with 醜 ("ugly").',
  '钟': '鐘 ("bell, clock") and 鍾 ("to cherish; a wine vessel") were merged into 钟.',
  '只': '只 ("sentence-final particle"; an ancient graph) was merged with 隻 ("numeral classifier").',
  '舍': '舍 ("dwelling"; an ancient graph) was merged with 捨 ("to give up").',
  '制': '制 ("system, regulation"; an ancient graph) was merged with 製 ("to manufacture").',
  '板': '板 ("wooden board"; an ancient graph) was merged with 闆 (as in 老闆, "boss").',

  /* ── Radical analogy: a simplified radical extends to a whole set of
        characters ── */
  '说': 'The 言 radical was simplified by analogy to 讠. 說 is the standard form and 説 an alternative form.',
  '钱': 'The 金 radical was simplified by analogy to 钅.',
  '经': 'The 糹 radical was simplified by analogy to 纟.',
  '论': 'The 言 radical was simplified by analogy to 讠.',
  '请': 'The 言 radical was simplified by analogy to 讠.',
  '记': 'The 言 radical was simplified by analogy to 讠.',
  '试': 'The 言 radical was simplified by analogy to 讠.',
  '语': 'The 言 radical was simplified by analogy to 讠.',
  '银': 'The 金 radical was simplified by analogy to 钅.',
  '线': 'The 糹 radical was simplified by analogy to 纟.',
  '级': 'The 糹 radical was simplified by analogy to 纟.',
};

/**
 * English notes for inherited characters (those with no simplified or
 * traditional distinction).
 */
export const EN_INHERITED_NOTES: Record<string, string> = {
  '家': '家 consists of 宀 ("roof") and 豕 ("pig") — a pig beneath a roof, an image of settled dwelling; it is already so in oracle bone script, identical in form from antiquity to the present, and has never undergone simplification.',
  '人': '人 depicts a human figure standing in profile; it is already so in oracle bone script, identical in form from antiquity to the present, and has never undergone simplification.',
  '山': '山 depicts three peaks standing side by side; it is already so in oracle bone script, identical in form from antiquity to the present, and has never undergone simplification.',
  '水': '水 depicts the shape of flowing water; it is already so in oracle bone script, identical in form from antiquity to the present, and has never undergone simplification.',
  '火': '火 depicts flames rising upward; it is already so in oracle bone script, identical in form from antiquity to the present, and has never undergone simplification.',
  '日': '日 depicts the shape of the sun; it is already so in oracle bone script, identical in form from antiquity to the present, and has never undergone simplification.',
  '月': '月 depicts the shape of a crescent moon; it is already so in oracle bone script, identical in form from antiquity to the present, and has never undergone simplification.',
  '木': '木 depicts the shape of a tree; it is already so in oracle bone script, identical in form from antiquity to the present, and has never undergone simplification.',
  '田': '田 depicts a field with crisscrossing raised paths (阡陌, the north-south and east-west field boundaries); it is already so in oracle bone script, identical in form from antiquity to the present, and has never undergone simplification.',
  '子': '子 depicts the shape of a swaddled infant; it is already so in oracle bone script, identical in form from antiquity to the present, and has never undergone simplification.',
};

export const EN_DEFAULT_INHERITED_NOTE = 'An inherited character: its form is unchanged from ancient times; it never underwent simplification.';
