# 说文解字集注英译指南（shuowen-en）

你的任务：把 JSON 文件中每个汉字的文言集注（shuowen 字段）翻译成流畅的现代英语。逐键填写 chunk 文件里对应条目的值（字符串），用 Edit/Write 工具**原地写回同一个文件**。不要改动键的顺序，不要新增或删除键。

输入文件：`<CHUNK_PATH>`（scripts/translations/chunks/shuowen-en-NNNN.json）
另外可用只读方式查看源数据 `public/shuowen.json` 中该字的 `shuowen` 原文（chunk 里只有键没有原文）。

## 规则

1. **流畅现代英语**，符合学术词典文风（参考 Etymological Dictionary 风格），每条译文 2-5 句。
2. **书名格式**：【廣韻】→ [Guangyun]，【說文】→ [Shuowen]，【六書正譌】→ [Liu Shu Zheng E]，【爾雅】→ [Erya]，【禮·月令】→ [Liji, Yueling]，【易·繫辭】→ [Yijing, Xici]，【老子·道德經】→ [Laozi, Daodejing]。书名首次出现时在方括号内音译即可，不保留汉字。
3. **引文**：直接译为英语并用引号括起，注明出处书名。
4. **专名**：少数必须保留汉字的术语（如六书类目 xiàngxíng 象形）可用 pinyin + 汉字括注，如 `xiàngxíng (象形, pictographic)`；一般情况只用英语。
5. **字形描述**：如「从某从某」「象形」「会意」翻译为 `composed of X and Y` / `pictographic` / `compound ideograph`。
6. **不编造**：无法确定的内容（如残缺引文）如实翻译为一般性表述，不要补写原文没有的信息。
7. **乱码条目**：若原文含乱码或不可读内容，译文写该字的结构信息（从源数据 `structure`/`sixBooks` 字段取），如 `An ancient character. Pictographic in structure.` 并在译文结尾加 `[note: source text partially corrupted]`。

## 输出格式示例

输入：
```json
{
  "明": "",
  "考": ""
}
```
输出（写入同一文件）：
```json
{
  "明": "In [Guangyun]: \"bright, the combined light of the sun and the moon.\" The character combines 日 (sun) and 月 (moon), a compound ideograph.",
  "考": "..."
}
```

完成后报告：共翻译 X 条，其中乱码条目 Y 条。
