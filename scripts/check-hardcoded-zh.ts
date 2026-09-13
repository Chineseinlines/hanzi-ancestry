/**
 * 扫描 src 下 JSX/字符串字面量中的 CJK 硬编码残留（排除注释、数据字面量、allowlist）。
 *   npx tsx scripts/check-hardcoded-zh.ts
 *
 * 用途：双语文案全部走 t() 后，此脚本兜底发现漏网的硬编码中文 UI 文案。
 * allowlist 覆盖：数据文件（src/data/* 的中文数据、zh.ts 字典本身）、
 * 字符常量（'家' 这类运行时汉字数据）、测试/脚本目录。
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC = path.resolve(__dirname, '../src');

/** 直接跳过扫描的路径（数据/字典） */
const SKIP_DIRS = new Set([
  path.join(SRC, 'i18n'), // 字典本身
]);

/** 文件级跳过 */
const SKIP_FILES = new Set([
  path.join(SRC, 'data', 'simpTradOrigins.ts'),
  path.join(SRC, 'data', 'simpTradOrigins.en.ts'),
  path.join(SRC, 'data', 'componentAnnotations.ts'),
  path.join(SRC, 'data', 'componentAnnotations.bilingual.ts'),
  path.join(SRC, 'data', 'ghostComponents.ts'),
  path.join(SRC, 'data', 'ghostComponents.bilingual.ts'),
  path.join(SRC, 'data', 'phoneticRating.ts'),
  path.join(SRC, 'data', 'phoneticRating.bilingual.ts'),
  path.join(SRC, 'data', 'visualGrammar.ts'),
  path.join(SRC, 'data', 'visualGrammar.en.ts'),
  path.join(SRC, 'data', 'modernTaxonomy.ts'),
  path.join(SRC, 'data', 'modernTaxonomy.en.ts'),
  path.join(SRC, 'data', 'phoneticLevels.ts'),
  path.join(SRC, 'data', 'phoneticLevels.en.ts'),
  path.join(SRC, 'data', 'semanticLevels.ts'),
  path.join(SRC, 'data', 'semanticLevels.en.ts'),
]);

/** 行级 allowlist：包含这些子串的 CJK 行忽略（纯数据字面量/注释/品牌） */
const LINE_ALLOWLIST = [
  /^\s*\/\//,                    // 注释行
  /^\s*\/\*/,                    // 块注释开头
  /^\s*\*/,                      // 块注释中间
  /const .*=\s*\[/,              // 数据数组声明行（如 RANDOM_CHARS）
  /const .*=\s*\{/,              // 数据对象声明行
  /const .*=\s*new Set\(/,       // Set 数据
  /'[^']*[一-鿿][^']*'\s*[,}]/,  // 单引号内含汉字的行（数据字面量）
  /"[^"]*[一-鿿][^"]*"\s*[,}]/,  // 双引号内含汉字的行（数据字面量）
  /'[^']*[一-鿿][^']*'\s*:\s*'/, // 对象键值对（TAG_COLORS 等）
  /[一-鿿]\s*[+>]/,              // 汉字参与运算/JSX 数据
  /^\s*[一-鿿]{1,4}\s*$/,        // 装饰性单字/品牌名行（字里行间、字、国）
  /title=\{lang/,                // 语言判断里的中文数据
  /COMMON_CHAR_SET/,
  /RANDOM_CHARS/,
  /QUICK_CHARS/,
  /isMoonBody|getMoonAnnotation/, // 月/肉判定数据
  /navigate\([^)]*char=/,        // 导航目标字数据
  /useState\('[一-鿿]/,           // state 初始字数据
  /return '[一-鿿]'/,            // 回退字数据
  /\{\/\*/,                      // JSX 注释
  /=== '[一-鿿]+'/,              // 单字比较数据
  /sb === '[一-鿿]+'/,           // 六书比较数据
  /基于定义自动推断/,            // 数据 note 模板
  /setSearchError/,              // 错误状态设置行（文本已走 t()）
  /tags\.push\('[一-鿿]+'\)/,    // 关系标签数据（scoreRelations）
  /folder = '默认'/,             // 默认收藏夹名
  /简体「\$\{simplified\}」对应繁体/, // 兜底说明（SimpTradTimeline zh 数据）
  /\[note: source text partially corrupted\]/, // 翻译数据标注
  /字里行间/,                    // 品牌名（不翻译）
  /lang === 'zh'/,               // 语言分支内的中文数据
  /aria-label="中文"/,           // 语言本身的名字
  /phoneticRating === '(green|yellow|red)'/, // 语言分支中间行
  /"[^"]+" \+ "[^"]+" →/,        // 结构组合示例（数据）
  /&ldquo;|&rdquo;/,             // HTML 实体引文示例
  /<span [^>]*>[一-鿿⿰⿱⿴⿺⿸⿻囗]+<\/span>/, // JSX 示例汉字/IDS 数据
  /font-serif-cn[^>]*>[一-鿿]/,  // 教学示例字
];

function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(full)) continue;
      yield* walk(full);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      if (!SKIP_FILES.has(full)) yield full;
    }
  }
}

const CJK_RE = /[一-鿿]/;
let violations = 0;

for (const file of walk(SRC)) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (!CJK_RE.test(line)) return;
    if (LINE_ALLOWLIST.some((re) => re.test(line.trim()))) return;
    console.log(`${path.relative(process.cwd(), file)}:${i + 1}: ${line.trim().slice(0, 100)}`);
    violations++;
  });
}

if (violations > 0) {
  console.log(`\n✗ ${violations} hardcoded CJK line(s) found — move them into src/i18n/locales`);
  process.exitCode = 1;
} else {
  console.log('✓ no hardcoded CJK UI text found');
}
