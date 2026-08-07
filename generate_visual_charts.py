# -*- coding: utf-8 -*-
"""
Generate visual charts and diagrams for PPT use.
All charts saved as PNG images and embedded into a Word document.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Arc, Circle, Wedge
import matplotlib.patheffects as pe
import numpy as np
import os

# ---- Global config ----
plt.rcParams['font.family'] = 'Microsoft YaHei'
plt.rcParams['font.size'] = 11
plt.rcParams['axes.unicode_minus'] = False

OUTPUT_DIR = r'C:\文件\大三\大三下\字里行间\新建文件夹\app\chart_images'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Color palette
C_RED    = '#C23B2A'
C_DARKRED = '#9B2226'
C_BLUE   = '#2D5F8A'
C_ORANGE = '#CA6702'
C_GOLD   = '#8B6914'
C_GREEN  = '#2E7D32'
C_GRAY   = '#A39E93'
C_LIGHT  = '#F2F0EB'
C_WHITE  = '#FFFFFF'
C_DARK   = '#2C2C2C'
C_YELLOW = '#F57F17'
C_CYAN   = '#0E7C7B'
C_PURPLE = '#6B4E71'
C_PINK   = '#C17C8F'

def save_chart(fig, name, dpi=200):
    path = os.path.join(OUTPUT_DIR, name)
    fig.savefig(path, dpi=dpi, bbox_inches='tight', facecolor='white', edgecolor='none')
    plt.close(fig)
    print(f'  Saved: {name}')
    return path


# ================================================================
# Chart 1: 拆解引擎四层架构 (Hierarchy Block Diagram)
# ================================================================
def chart1_architecture():
    fig, ax = plt.subplots(figsize=(12, 5))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 5)
    ax.axis('off')
    ax.set_facecolor('white')

    layers = [
        (4.2, '第一层\n数据源', 'hanzi-dict.json\n六书分类 + IDS + 说文', C_RED),
        (3.0, '第二层\n拆解引擎', 'buildTree()\n根据六书类型差异化拆解', C_ORANGE),
        (1.8, '第三层\n部件标注', 'annotateTypes()\n语义/语音标注 + 幽灵检测 + 声旁评级', C_BLUE),
        (0.6, '第四层\n可视化渲染', 'DecompositionGraph\nD3 树形图 · 颜色编码 · 交互导航', C_GREEN),
    ]

    for i, (y, title, desc, color) in enumerate(layers):
        # Main block
        rect = FancyBboxPatch((0.3, y), 11.4, 1.0, boxstyle='round,pad=0.08',
                              facecolor=color, edgecolor='white', linewidth=2, alpha=0.92)
        ax.add_patch(rect)
        # Title
        ax.text(1.8, y + 0.6, title, fontsize=16, fontweight='bold', color='white', va='center', ha='center')
        # Desc
        ax.text(7.0, y + 0.5, desc, fontsize=11, color='white', va='center', ha='center', alpha=0.95)
        # Down arrow
        if i < len(layers) - 1:
            next_y = layers[i+1][0] + 1.0
            ax.annotate('', xy=(6.0, next_y + 0.05), xytext=(6.0, y - 0.05),
                       arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2.5, connectionstyle='arc3,rad=0'))

    ax.set_title('六书驱动的汉字智能拆解引擎 · 四层架构', fontsize=18, fontweight='bold', color=C_DARK, pad=15)
    return save_chart(fig, '01_四层架构.png')


# ================================================================
# Chart 2: 六书 × 拆解策略 (Horizontal Bar Chart)
# ================================================================
def chart2_six_books():
    fig, ax = plt.subplots(figsize=(12, 4.5))
    ax.set_facecolor('white')

    types = ['象形字', '指事字', '形声字', '会意字', '转注字', '假借字']
    strategies = ['不拆分\n(原子节点)', '不拆分\n(原子节点)', '单层展开\n形旁 + 声旁', 'IDS提取\nCJK部件', '间接覆盖\n(系联网络)', '仅展示\n(详情页)']
    colors = [C_RED, C_ORANGE, C_BLUE, C_GOLD, C_GRAY, C_GRAY]
    node_shapes = ['● 核心红圆', '● 核心红圆', '● 语义蓝圆\n◆ 语音橙菱', '● 金色圆', '—', '—']

    y_pos = range(len(types))
    bars = ax.barh(y_pos, [5, 4, 8, 6, 2, 1], color=colors, height=0.55, edgecolor='white', linewidth=1.5, alpha=0.9)

    for i, (bar, strat, shape) in enumerate(zip(bars, strategies, node_shapes)):
        w = bar.get_width()
        ax.text(w + 0.15, bar.get_y() + bar.get_height()/2, f'{strat}    {shape}',
                va='center', fontsize=11, color=C_DARK, fontweight='bold')

    ax.set_yticks(y_pos)
    ax.set_yticklabels(types, fontsize=13, fontweight='bold')
    ax.set_xlim(0, 13)
    ax.axis('off')
    ax.set_title('六书分类 × 拆解策略', fontsize=18, fontweight='bold', color=C_DARK, pad=12)

    # Legend
    legend_elements = [
        mpatches.Patch(color=C_RED, label='象形/指事：原子不拆分'),
        mpatches.Patch(color=C_BLUE, label='形声：形旁+声旁'),
        mpatches.Patch(color=C_GOLD, label='会意：部件提取'),
        mpatches.Patch(color=C_GRAY, label='转注/假借：间接处理'),
    ]
    ax.legend(handles=legend_elements, loc='lower right', fontsize=9, framealpha=0.9)

    return save_chart(fig, '02_六书拆解策略.png')


# ================================================================
# Chart 3: 拆解流水线 (Flow Chart)
# ================================================================
def chart3_pipeline():
    fig, ax = plt.subplots(figsize=(13, 4))
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 3.5)
    ax.axis('off')

    steps = [
        ('①\n输入汉字', C_RED),
        ('②\n查六书类型', C_ORANGE),
        ('③\n分支拆解', C_BLUE),
        ('④\nIDS清洗', C_GOLD),
        ('⑤\n变形标注\n+幽灵检测', C_GREEN),
        ('⑥\nD3渲染', C_PURPLE),
    ]

    for i, (label, color) in enumerate(steps):
        x = 0.5 + i * 2.1
        # Box
        rect = FancyBboxPatch((x, 1.0), 1.7, 1.3, boxstyle='round,pad=0.1',
                              facecolor=color, edgecolor='white', linewidth=2, alpha=0.9)
        ax.add_patch(rect)
        ax.text(x + 0.85, 1.65, label, fontsize=11, fontweight='bold', color='white', va='center', ha='center')
        # Arrow
        if i < len(steps) - 1:
            ax.annotate('', xy=(x + 1.85, 1.65), xytext=(x + 1.95, 1.65),
                       arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2.2))

    ax.set_title('拆解引擎处理流水线', fontsize=18, fontweight='bold', color=C_DARK, pad=15)
    return save_chart(fig, '03_拆解流水线.png')


# ================================================================
# Chart 4: 声旁三色评级 (Donut Chart + Examples)
# ================================================================
def chart4_phonetic_rating():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4.8))
    fig.patch.set_facecolor('white')

    # Left: Donut chart
    sizes = [35, 40, 25]
    labels = ['准确\n声韵全匹配', '近似\n声/韵部分匹配', '失效\n声韵全不匹配']
    colors_donut = [C_GREEN, C_YELLOW, C_RED]
    explode = (0.03, 0.03, 0.03)

    wedges, texts = ax1.pie(sizes, explode=explode, labels=None, colors=colors_donut,
                             startangle=90, counterclock=False,
                             wedgeprops=dict(width=0.35, edgecolor='white', linewidth=2))
    # Center number
    ax1.text(0, 0, '声旁\n评级', ha='center', va='center', fontsize=16, fontweight='bold', color=C_DARK)
    ax1.set_title('三色评级分布', fontsize=14, fontweight='bold', color=C_DARK)

    # Right: Example table as visual
    ax2.set_xlim(0, 6)
    ax2.set_ylim(0, 4)
    ax2.axis('off')
    ax2.set_title('评级示例', fontsize=14, fontweight='bold', color=C_DARK)

    examples = [
        (3.2, C_GREEN, '[V] 准确', '沐 mù ← 木 mù', '声韵全同'),
        (2.0, C_YELLOW, '~ 近似', '江 jiāng ← 工 gōng', '韵母相近'),
        (0.8, C_RED, '[X] 失效', '河 hé ← 可 kě', '声韵全异'),
    ]
    for y, color, rating, example, note in examples:
        rect = FancyBboxPatch((0.3, y), 5.4, 0.9, boxstyle='round,pad=0.05',
                              facecolor=color, edgecolor='white', linewidth=1.5, alpha=0.85)
        ax2.add_patch(rect)
        ax2.text(0.8, y + 0.45, f'{rating}', fontsize=14, fontweight='bold', color='white', va='center')
        ax2.text(2.6, y + 0.45, f'{example}', fontsize=12, color='white', va='center')
        ax2.text(4.8, y + 0.45, f'{note}', fontsize=10, color='white', va='center', alpha=0.85)

    # Color legend
    legend_elements = [
        mpatches.Patch(color=C_GREEN, label='准确 Accurate'),
        mpatches.Patch(color=C_YELLOW, label='近似 Approximate'),
        mpatches.Patch(color=C_RED, label='失效 Failed'),
    ]
    fig.legend(handles=legend_elements, loc='lower center', ncol=3, fontsize=10, frameon=False)

    fig.suptitle('声旁可靠性三色评级系统', fontsize=18, fontweight='bold', color=C_DARK, y=1.02)
    return save_chart(fig, '04_声旁三色评级.png')


# ================================================================
# Chart 5: 系联网络四阶段架构
# ================================================================
def chart5_network_arch():
    fig, ax = plt.subplots(figsize=(12, 5.5))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 5.5)
    ax.axis('off')

    stages = [
        (4.5, '阶段一：索引构建', '7 个内存倒排索引\nphoneticIndex · semanticIndex · pinyinIndex\nreverseIndex · radicalIndex · structuralRank', C_BLUE),
        (3.2, '阶段二：关系计算', '9 种关系类型 · 4 级优先级\n互斥去重 · 简繁智能去重', C_ORANGE),
        (1.9, '阶段三：三维评分', '字形 × 字音 × 字义\n几何平均 × 协同加成 × 频率修正', C_GOLD),
        (0.6, '阶段四：可视化', 'D3 力导向图 · 9 色边编码\n节点大小 ∝ 关系强度', C_GREEN),
    ]

    for i, (y, title, desc, color) in enumerate(stages):
        rect = FancyBboxPatch((0.3, y), 11.4, 1.1, boxstyle='round,pad=0.08',
                              facecolor=color, edgecolor='white', linewidth=2, alpha=0.9)
        ax.add_patch(rect)
        ax.text(2.2, y + 0.65, title, fontsize=15, fontweight='bold', color='white', va='center', ha='center')
        ax.text(7.5, y + 0.55, desc, fontsize=10, color='white', va='center', ha='center', alpha=0.92)
        if i < len(stages) - 1:
            next_y = stages[i+1][0] + 1.1
            ax.annotate('', xy=(6.0, next_y + 0.05), xytext=(6.0, y - 0.05),
                       arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2.5))

    ax.set_title('多维汉字系联网络 · 四阶段架构', fontsize=18, fontweight='bold', color=C_DARK, pad=12)
    return save_chart(fig, '05_系联网络架构.png')


# ================================================================
# Chart 6: 九种关系类型 (Horizontal Bar Chart)
# ================================================================
def chart6_nine_relations():
    fig, ax = plt.subplots(figsize=(12, 5.5))
    ax.set_facecolor('white')

    relations = [
        ('源流分化', 30, C_RED, 'P1'),
        ('反义对', 30, C_DARKRED, 'P1'),
        ('同声旁族', 50, C_ORANGE, 'P2'),
        ('同形旁族', 50, C_BLUE, 'P2'),
        ('共享构件', 50, C_GRAY, 'P2'),
        ('构件包含', 40, C_GREEN, 'P3'),
        ('同音字', 20, C_GOLD, 'P3'),
        ('近音字', 20, C_GOLD, 'P3'),
        ('同部首族', 40, C_CYAN, 'P4'),
    ]

    names = [r[0] for r in relations]
    caps  = [r[1] for r in relations]
    colors = [r[2] for r in relations]
    priorities = [r[3] for r in relations]

    y_pos = range(len(names))
    bars = ax.barh(y_pos, caps, color=colors, height=0.6, edgecolor='white', linewidth=1.5, alpha=0.9)

    for i, (bar, cap, pri) in enumerate(zip(bars, caps, priorities)):
        ax.text(bar.get_width() + 0.7, bar.get_y() + bar.get_height()/2,
                f'{pri}  ·  上限 {cap}', va='center', fontsize=10, color=C_DARK, fontweight='bold')

    ax.set_yticks(y_pos)
    ax.set_yticklabels(names, fontsize=12, fontweight='bold')
    ax.set_xlim(0, 64)
    ax.axis('off')
    ax.set_title('九种关系类型 × 四级优先级', fontsize=18, fontweight='bold', color=C_DARK, pad=12)

    # Legend
    leg = ax.legend(
        handles=[
            mpatches.Patch(color=C_RED, label='P1 最高优先'),
            mpatches.Patch(color=C_ORANGE, label='P2 高优先'),
            mpatches.Patch(color=C_GREEN, label='P3 中优先'),
            mpatches.Patch(color=C_CYAN, label='P4 基础优先'),
        ],
        loc='lower right', fontsize=9, framealpha=0.9, ncol=2
    )

    return save_chart(fig, '06_九种关系类型.png')


# ================================================================
# Chart 7: 互斥去重机制 (Flow Diagram)
# ================================================================
def chart7_dedup():
    fig, ax = plt.subplots(figsize=(12, 3.2))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 2.5)
    ax.axis('off')

    steps = [
        ('claimed\n= Set()', C_DARK),
        ('P1→P4\n按优先级', C_RED),
        ('重要度\n排序', C_ORANGE),
        ('简繁\n去重', C_BLUE),
        ('取Top-N\n去已认领', C_GREEN),
        ('加入\nclaimed', C_PURPLE),
    ]

    for i, (label, color) in enumerate(steps):
        x = 0.3 + i * 2.0
        rect = FancyBboxPatch((x, 0.8), 1.6, 1.0, boxstyle='round,pad=0.08',
                              facecolor=color, edgecolor='white', linewidth=2, alpha=0.9)
        ax.add_patch(rect)
        ax.text(x + 0.8, 1.3, label, fontsize=10, fontweight='bold', color='white', va='center', ha='center')
        if i < len(steps) - 1:
            ax.annotate('', xy=(x + 1.75, 1.3), xytext=(x + 2.05, 1.3),
                       arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2.2))

    ax.set_title('互斥去重机制 · takeList 算法', fontsize=18, fontweight='bold', color=C_DARK, pad=15)

    # Add note at bottom
    fig.text(0.5, 0.02, '核心原则：每个汉字仅在其最高优先级关系中亮相一次，避免重复展示',
             ha='center', fontsize=10, color=C_GRAY, style='italic')

    return save_chart(fig, '07_互斥去重机制.png')


# ================================================================
# Chart 8: 三维亲密度评分 (Radar Chart)
# ================================================================
def chart8_radar():
    categories = ['字形\nForm', '字音\nSound', '字义\nMeaning']
    N = len(categories)

    # Example: 3 different characters
    examples = {
        '沐 ← 木 (强关联)': [75, 100, 60],
        '河 ← 可 (弱关联)': [30, 0, 30],
        '江 ← 工 (中关联)': [55, 50, 40],
    }

    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    angles += angles[:1]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5.5))
    fig.patch.set_facecolor('white')

    # Left: Radar chart
    ax1 = fig.add_subplot(1, 2, 1, projection='polar')
    ax1.set_facecolor('white')

    colors_radar = [C_GREEN, C_RED, C_YELLOW]
    for (label, values), color in zip(examples.items(), colors_radar):
        values_plot = values + values[:1]
        ax1.fill(angles, values_plot, alpha=0.15, color=color)
        ax1.plot(angles, values_plot, 'o-', linewidth=2.5, color=color, label=label, markersize=6)

    ax1.set_xticks(angles[:-1])
    ax1.set_xticklabels(categories, fontsize=12, fontweight='bold')
    ax1.set_ylim(0, 100)
    ax1.set_yticks([20, 40, 60, 80, 100])
    ax1.set_yticklabels(['20', '40', '60', '80', '100'], fontsize=8, color=C_GRAY)
    ax1.set_title('三维亲密度雷达图', fontsize=14, fontweight='bold', color=C_DARK, pad=18)
    ax1.legend(loc='upper right', bbox_to_anchor=(1.35, 1.1), fontsize=9, framealpha=0.9)
    ax1.grid(True, alpha=0.3)

    # Right: Formula breakdown
    ax2.set_xlim(0, 6)
    ax2.set_ylim(0, 4.5)
    ax2.axis('off')
    ax2.set_title('综合评分公式', fontsize=14, fontweight='bold', color=C_DARK)

    formula_parts = [
        (3.8, C_BLUE, '几何平均', 'cbrt(字形 × 字音 × 字义)', '惩罚单维度匹配'),
        (2.5, C_ORANGE, '协同加成', '三维>20 → ×1.5\n二维>20 → ×1.2', '奖励多维关联'),
        (1.2, C_GREEN, '频率修正', '0.35 ~ 1.35\n(min(1.35, 0.35+log2/6))', '提升基础字权重'),
        (0.1, C_RED, '最终得分', '几何平均 × 协同 × 频率', '按此降序排列输出'),
    ]
    for y, color, title, expr, note in formula_parts:
        rect = FancyBboxPatch((0.2, y), 5.6, 1.0, boxstyle='round,pad=0.06',
                              facecolor=color, edgecolor='white', linewidth=1.5, alpha=0.88)
        ax2.add_patch(rect)
        ax2.text(0.6, y + 0.65, title, fontsize=13, fontweight='bold', color='white', va='center')
        ax2.text(2.6, y + 0.6, expr, fontsize=10, color='white', va='center')
        ax2.text(4.7, y + 0.6, note, fontsize=9, color='white', va='center', alpha=0.8)

    fig.suptitle('形音义三维亲密度评分算法', fontsize=18, fontweight='bold', color=C_DARK, y=1.02)
    return save_chart(fig, '08_三维评分.png')


# ================================================================
# Chart 9: 七大倒排索引 (Knowledge Graph Style)
# ================================================================
def chart9_indices():
    fig, ax = plt.subplots(figsize=(12, 7))
    ax.set_xlim(-6, 6)
    ax.set_ylim(-6, 6)
    ax.axis('off')
    ax.set_facecolor('white')

    # Center: loadData()
    center = Circle((0, 0), 0.9, facecolor=C_RED, edgecolor='white', linewidth=3, zorder=10)
    ax.add_patch(center)
    ax.text(0, 0, 'loadData()\n索引构建', ha='center', va='center', fontsize=10, fontweight='bold', color='white')

    # 7 indices around center
    indices = [
        (0, 4.5, 'phoneticIndex', '声旁 → 字族', C_ORANGE, '木→{沐,霖,林...}'),
        (2.7, 3.6, 'semanticIndex', '形旁 → 字族', C_BLUE, '氵→{江,河,海...}'),
        (4.3, 1.5, 'pinyinIndex', '拼音 → 同音字', C_GOLD, 'mù→{木,沐,牧...}'),
        (4.3, -1.5, 'pinyinNoTone', '去调拼音 → 近音字', C_GOLD, 'mu→{母,木,目...}'),
        (2.7, -3.6, 'reverseIndex', '部件 → 包含字', C_GREEN, '木→[沐,霖,李...]'),
        (0, -4.5, 'radicalIndex', '部首 → 同部字', C_CYAN, '木→[林,森,板...]'),
        (-2.7, -3.6, 'structuralRank', '部件 → 重要度', C_PURPLE, '木→高引用计数'),
    ]

    for x, y, name, desc, color, example in indices:
        # Node
        circ = Circle((x, y), 1.15, facecolor=color, edgecolor='white', linewidth=2.5, alpha=0.9, zorder=8)
        ax.add_patch(circ)
        ax.text(x, y + 0.25, name, ha='center', va='center', fontsize=9, fontweight='bold', color='white')
        ax.text(x, y - 0.3, desc, ha='center', va='center', fontsize=7.5, color='white', alpha=0.9)
        # Connecting line
        ax.plot([0, x * 0.45], [0, y * 0.45], color=color, linewidth=1.8, alpha=0.5, zorder=5)

    ax.set_title('七大内存倒排索引 · 知识图谱', fontsize=18, fontweight='bold', color=C_DARK, pad=12)
    return save_chart(fig, '09_七大索引知识图谱.png')


# ================================================================
# Chart 10: 两大系统对比 (Side-by-Side Comparison)
# ================================================================
def chart10_comparison():
    fig, ax = plt.subplots(figsize=(13, 6))
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 6.5)
    ax.axis('off')
    ax.set_facecolor('white')

    # Title
    ax.text(6.5, 6.1, '两大核心系统定位对比', ha='center', fontsize=20, fontweight='bold', color=C_DARK)

    # Left system: Decomposition Engine
    left_rect = FancyBboxPatch((0.4, 0.3), 5.6, 5.3, boxstyle='round,pad=0.15',
                                facecolor='#FDF6F5', edgecolor=C_RED, linewidth=2.5)
    ax.add_patch(left_rect)
    ax.text(3.2, 5.2, '拆解引擎', ha='center', fontsize=17, fontweight='bold', color=C_RED)
    ax.text(3.2, 4.5, '纵向深入  ·  解剖刀', ha='center', fontsize=11, color=C_DARK, style='italic')

    left_items = [
        ('>> 视角', '纵向：单个汉字内部结构'),
        ('>> 核心', 'buildTree() + annotateTypes()'),
        ('>> 可视化', 'D3 树形图（层级展开）'),
        ('>> 颜色', '红/蓝/橙/金 四色节点编码'),
        ('>> 标记', '幽灵部件虚线 + 声旁三色评级'),
        ('>> 理论', '《说文》六书 + 王宁构形学'),
    ]
    for i, (key, val) in enumerate(left_items):
        y = 3.8 - i * 0.58
        ax.text(3.2, y, key, ha='center', fontsize=9.5, fontweight='bold', color=C_RED)
        ax.text(3.2, y - 0.28, val, ha='center', fontsize=9, color=C_DARK)

    # Right system: Connection Network
    right_rect = FancyBboxPatch((6.8, 0.3), 5.8, 5.3, boxstyle='round,pad=0.15',
                                 facecolor='#FDF8F0', edgecolor=C_ORANGE, linewidth=2.5)
    ax.add_patch(right_rect)
    ax.text(9.7, 5.2, '系联网络', ha='center', fontsize=17, fontweight='bold', color=C_ORANGE)
    ax.text(9.7, 4.5, '横向展开  ·  关系网', ha='center', fontsize=11, color=C_DARK, style='italic')

    right_items = [
        ('>> 视角', '横向：汉字之间多维关联'),
        ('>> 核心', 'computeRelations()+scoreRelations()'),
        ('>> 可视化', 'D3 力导向图（自由展开）'),
        ('>> 颜色', '9 色边 + 节点大小∝关系强度'),
        ('>> 标记', '反义虚线 + 简繁智能去重'),
        ('>> 理论', '王宁字族系联 + 沈兼士右文说'),
    ]
    for i, (key, val) in enumerate(right_items):
        y = 3.8 - i * 0.58
        ax.text(9.7, y, key, ha='center', fontsize=9.5, fontweight='bold', color=C_ORANGE)
        ax.text(9.7, y - 0.28, val, ha='center', fontsize=9, color=C_DARK)

    # Connecting arrow
    ax.annotate('', xy=(6.6, 3.0), xytext=(6.2, 3.0),
               arrowprops=dict(arrowstyle='<->', color=C_GRAY, lw=2.5))
    ax.text(6.4, 2.55, '点击\n串联', ha='center', fontsize=8, color=C_GRAY, fontweight='bold')

    return save_chart(fig, '10_两大系统对比.png')


# ================================================================
# Chart 11: 端到端数据流全景 (Comprehensive Pipeline)
# ================================================================
def chart11_full_pipeline():
    fig, ax = plt.subplots(figsize=(14, 6.5))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 6.5)
    ax.axis('off')
    ax.set_facecolor('white')

    # User input
    user = FancyBboxPatch((0.3, 4.5), 1.6, 1.3, boxstyle='round,pad=0.1',
                          facecolor=C_DARK, edgecolor='white', linewidth=2)
    ax.add_patch(user)
    ax.text(1.1, 5.15, '[用户]\n输入"沐"', ha='center', va='center', fontsize=11, fontweight='bold', color='white')

    # Arrow 1
    ax.annotate('', xy=(2.3, 5.15), xytext=(2.1, 5.15),
               arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2))

    # Data loading
    load = FancyBboxPatch((2.5, 4.2), 2.0, 1.9, boxstyle='round,pad=0.1',
                          facecolor=C_BLUE, edgecolor='white', linewidth=2)
    ax.add_patch(load)
    ax.text(3.5, 5.5, '数据加载', ha='center', fontsize=12, fontweight='bold', color='white')
    ax.text(3.5, 4.9, 'fetch JSON\n构建 7 个索引\n~500KB / 3-5s', ha='center', fontsize=8.5, color='white', alpha=0.9)

    # Arrow 2
    ax.annotate('', xy=(4.8, 5.15), xytext=(4.6, 5.15),
               arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2))

    # Decomposition
    decomp = FancyBboxPatch((5.0, 4.3), 2.2, 1.7, boxstyle='round,pad=0.1',
                            facecolor=C_RED, edgecolor='white', linewidth=2)
    ax.add_patch(decomp)
    ax.text(6.1, 5.5, '拆解引擎', ha='center', fontsize=12, fontweight='bold', color='white')
    ax.text(6.1, 4.9, '查六书→buildTree()\n→annotateTypes()\n<10ms', ha='center', fontsize=8.5, color='white', alpha=0.9)

    # Arrow 3
    ax.annotate('', xy=(7.5, 5.15), xytext=(7.3, 5.15),
               arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2))

    # Decomp Render
    d3_1 = FancyBboxPatch((7.7, 4.5), 2.0, 1.3, boxstyle='round,pad=0.1',
                          facecolor=C_GREEN, edgecolor='white', linewidth=2)
    ax.add_patch(d3_1)
    ax.text(8.7, 5.15, 'D3 树形图\n拆解可视化', ha='center', fontsize=10, fontweight='bold', color='white')

    # Arrow down from decomp
    ax.annotate('', xy=(6.1, 4.15), xytext=(6.1, 3.1),
               arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2, connectionstyle='arc3,rad=0'))

    # User clicks phonetic
    click = FancyBboxPatch((5.0, 1.2), 2.2, 1.5, boxstyle='round,pad=0.1',
                           facecolor=C_DARK, edgecolor='white', linewidth=2)
    ax.add_patch(click)
    ax.text(6.1, 2.1, '[Click]  点击声旁\n触发系联查询', ha='center', fontsize=10, fontweight='bold', color='white')

    # Arrow right
    ax.annotate('', xy=(7.5, 1.95), xytext=(7.3, 1.95),
               arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2))

    # Relation compute
    rel = FancyBboxPatch((7.7, 1.4), 2.0, 1.1, boxstyle='round,pad=0.1',
                         facecolor=C_ORANGE, edgecolor='white', linewidth=2)
    ax.add_patch(rel)
    ax.text(8.7, 1.95, '关系计算\n<50ms', ha='center', fontsize=10, fontweight='bold', color='white')

    # Arrow
    ax.annotate('', xy=(10.0, 1.95), xytext=(9.8, 1.95),
               arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2))

    # Scoring
    score = FancyBboxPatch((10.2, 1.4), 1.8, 1.1, boxstyle='round,pad=0.1',
                           facecolor=C_GOLD, edgecolor='white', linewidth=2)
    ax.add_patch(score)
    ax.text(11.1, 1.95, '三维评分\n<30ms', ha='center', fontsize=10, fontweight='bold', color='white')

    # Arrow
    ax.annotate('', xy=(12.3, 1.95), xytext=(12.1, 1.95),
               arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2))

    # Final render
    d3_2 = FancyBboxPatch((12.4, 1.4), 1.4, 1.1, boxstyle='round,pad=0.1',
                          facecolor=C_GREEN, edgecolor='white', linewidth=2)
    ax.add_patch(d3_2)
    ax.text(13.1, 1.95, 'D3\n力导向图', ha='center', fontsize=10, fontweight='bold', color='white')

    # Big picture connecting arrow
    ax.annotate('', xy=(13.8, 2.5), xytext=(13.8, 4.5),
               arrowprops=dict(arrowstyle='->', color=C_BLUE, lw=2, connectionstyle='arc3,rad=0.3'))
    ax.text(14.4, 3.5, '双图联动\n交互闭环', ha='center', fontsize=9, color=C_BLUE, fontweight='bold', rotation=90)

    ax.set_title('端到端数据流全景：从输入到可视化', fontsize=18, fontweight='bold', color=C_DARK, pad=15)
    return save_chart(fig, '11_端到端数据流.png')


# ================================================================
# Chart 12: 布鲁姆认知目标映射 (Matrix-style visual)
# ================================================================
def chart12_bloom():
    fig, ax = plt.subplots(figsize=(13, 5.5))
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 6)
    ax.axis('off')
    ax.set_facecolor('white')

    blooms = [
        (5.2, '记忆', '汉字详情页', '识记字形·读音·释义', C_GRAY),
        (4.3, '理解', '部件拆解图', '理解构形理据', C_BLUE),
        (3.4, '应用', '字形演变时间轴', '认识历史演变', C_CYAN),
        (2.5, '分析', '同源字关系网络', '分析多维关联', C_ORANGE),
        (1.6, '评价', '声旁三色评级', '判断表音可靠性', C_GOLD),
        (0.7, '创造', '汉字拼拆游戏', '运用知识创造', C_RED),
    ]

    for y, level, feature, output, color in blooms:
        # Level label
        rect = FancyBboxPatch((0.3, y), 2.2, 0.72, boxstyle='round,pad=0.05',
                              facecolor=color, edgecolor='white', linewidth=1.5, alpha=0.9)
        ax.add_patch(rect)
        ax.text(1.4, y + 0.36, level, fontsize=13, fontweight='bold', color='white', va='center', ha='center')

        # Arrow
        ax.annotate('', xy=(2.8, y + 0.36), xytext=(2.6, y + 0.36),
                   arrowprops=dict(arrowstyle='->', color=color, lw=2))

        # Feature
        rect2 = FancyBboxPatch((3.0, y), 3.5, 0.72, boxstyle='round,pad=0.05',
                               facecolor=color, edgecolor='white', linewidth=1, alpha=0.25)
        ax.add_patch(rect2)
        ax.text(4.75, y + 0.36, feature, fontsize=11, fontweight='bold', color=color, va='center', ha='center')

        # Arrow
        ax.annotate('', xy=(6.8, y + 0.36), xytext=(6.6, y + 0.36),
                   arrowprops=dict(arrowstyle='->', color=color, lw=1.5, alpha=0.6))

        # Output
        ax.text(8.5, y + 0.36, output, fontsize=10, color=C_DARK, va='center', ha='left', fontweight='bold')

    # Pyramid hint
    ax.text(11.5, 3.0, '^\n高\n阶\n思\n维\nv\n基\n础\n认\n知', ha='center', fontsize=9, color=C_GRAY)

    ax.set_title('布鲁姆认知目标 × 产品功能映射', fontsize=18, fontweight='bold', color=C_DARK, pad=12)
    return save_chart(fig, '12_布鲁姆认知映射.png')


# ================================================================
# Chart 13: 幽灵部件 & 变形偏旁 总览
# ================================================================
def chart13_ghost_variants():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5))
    fig.patch.set_facecolor('white')

    # Left: Ghost components
    ax1.set_xlim(0, 5)
    ax1.set_ylim(0, 4.5)
    ax1.axis('off')
    ax1.set_title('幽灵部件 (15字)', fontsize=14, fontweight='bold', color=C_DARK)

    ghost_data = [
        (3.8, '买 ← 買', '草书楷化'),
        (3.1, '尽 ← 盡', '草书楷化'),
        (2.4, '专 ← 專', '草书楷化'),
        (1.7, '头 ← 頭', '草书楷化'),
        (1.0, '发 ← 發/髮', '多字合并'),
        (0.3, '后 ← 後', '同音替代'),
    ]
    for y, label, reason in ghost_data:
        rect = FancyBboxPatch((0.2, y), 4.6, 0.55, boxstyle='round,pad=0.04',
                              facecolor=C_GRAY, edgecolor='white', linewidth=1.2, alpha=0.85)
        ax1.add_patch(rect)
        ax1.text(2.5, y + 0.27, f'{label}    【{reason}】', fontsize=10.5, color='white', va='center', ha='center', fontweight='bold')

    # Right: Variant radicals
    ax2.set_xlim(0, 5)
    ax2.set_ylim(0, 4.5)
    ax2.axis('off')
    ax2.set_title('变形偏旁 (12例)', fontsize=14, fontweight='bold', color=C_DARK)

    variants = [
        ('忄 → 心', '氵 → 水', C_BLUE),
        ('扌 → 手', '犭 → 犬', C_ORANGE),
        ('灬 → 火', '亻 → 人', C_GOLD),
        ('阝 → 阜/邑', '钅 → 金', C_GREEN),
        ('月 → 肉/月', '饣 → 食', C_PURPLE),
        ('纟 → 糸', '艹 → 艸', C_CYAN),
    ]
    for i, (v1, v2, color) in enumerate(variants):
        y = 3.8 - i * 0.65
        # Left variant
        r1 = FancyBboxPatch((0.2, y), 2.1, 0.5, boxstyle='round,pad=0.04',
                            facecolor=color, edgecolor='white', linewidth=1.2, alpha=0.85)
        ax2.add_patch(r1)
        ax2.text(1.25, y + 0.25, v1, fontsize=10.5, color='white', va='center', ha='center', fontweight='bold')
        # Right variant
        r2 = FancyBboxPatch((2.6, y), 2.1, 0.5, boxstyle='round,pad=0.04',
                            facecolor=color, edgecolor='white', linewidth=1.2, alpha=0.85)
        ax2.add_patch(r2)
        ax2.text(3.65, y + 0.25, v2, fontsize=10.5, color='white', va='center', ha='center', fontweight='bold')

    fig.suptitle('简化溯源：幽灵部件 + 变形偏旁', fontsize=16, fontweight='bold', color=C_DARK, y=1.02)
    return save_chart(fig, '13_幽灵部件与变形偏旁.png')


# ================================================================
# Chart 14: 简繁去重三通道 (3-channel diagram)
# ================================================================
def chart14_simp_trad():
    fig, ax = plt.subplots(figsize=(12, 4))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 3.5)
    ax.axis('off')

    channels = [
        (0.5, '通道一：显式映射', '查 simp-trad-map.json\n已知简繁配对', '国 ↔ 國', C_BLUE),
        (4.0, '通道二：拼音·释义推断', '同拼音 + 完全同释义\n→ 认定为异体', '为 ↔ 爲', C_ORANGE),
        (7.5, '通道三：标记级联传播', '部首标记→部件标记\n→ 二级传播', '言→讠 全局传播', C_GREEN),
    ]

    for x, title, desc, example, color in channels:
        rect = FancyBboxPatch((x, 0.5), 3.4, 2.5, boxstyle='round,pad=0.1',
                              facecolor=color, edgecolor='white', linewidth=2, alpha=0.9)
        ax.add_patch(rect)
        ax.text(x + 1.7, 2.5, title, ha='center', fontsize=12, fontweight='bold', color='white')
        ax.text(x + 1.7, 1.8, desc, ha='center', fontsize=9.5, color='white', alpha=0.92)
        # Example box
        ex_rect = FancyBboxPatch((x + 0.4, 0.65), 2.6, 0.5, boxstyle='round,pad=0.03',
                                 facecolor='white', edgecolor='none', alpha=0.25)
        ax.add_patch(ex_rect)
        ax.text(x + 1.7, 0.9, f'例：{example}', ha='center', fontsize=9.5, color='white', fontweight='bold')

        if x < 7:
            ax.annotate('', xy=(x + 3.55, 1.75), xytext=(x + 3.75, 1.75),
                       arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2))

    ax.set_title('简繁智能去重 · 三通道策略', fontsize=18, fontweight='bold', color=C_DARK, pad=12)
    return save_chart(fig, '14_简繁去重三通道.png')


# ================================================================
# Chart 15: 数据架构总览 (System Overview)
# ================================================================
def chart15_system_overview():
    fig, ax = plt.subplots(figsize=(14, 7))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 7)
    ax.axis('off')
    ax.set_facecolor('white')

    # Data layer
    data_rect = FancyBboxPatch((0.3, 5.2), 3.5, 1.3, boxstyle='round,pad=0.08',
                                facecolor=C_GRAY, edgecolor='white', linewidth=2)
    ax.add_patch(data_rect)
    ax.text(2.05, 6.2, '[Data]  静态数据层', fontsize=13, fontweight='bold', color='white')
    ax.text(2.05, 5.6, 'hanzi-dict.json\nhanzi-index.json\nsimp-trad-map.json', fontsize=9, color='white', alpha=0.9)

    # Index layer
    ax.annotate('', xy=(2.05, 5.05), xytext=(2.05, 4.3),
               arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2.5))
    idx_rect = FancyBboxPatch((0.3, 3.0), 3.5, 1.1, boxstyle='round,pad=0.08',
                               facecolor=C_BLUE, edgecolor='white', linewidth=2)
    ax.add_patch(idx_rect)
    ax.text(2.05, 3.8, '[Index]  内存索引层', fontsize=13, fontweight='bold', color='white')
    ax.text(2.05, 3.3, '7 个 Map<Key, Set<Char>>\nO(1) 查询', fontsize=9, color='white', alpha=0.9)

    # Compute layer
    ax.annotate('', xy=(2.05, 2.85), xytext=(2.05, 2.1),
               arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=2.5))
    comp_rect = FancyBboxPatch((0.3, 0.8), 3.5, 1.1, boxstyle='round,pad=0.08',
                                facecolor=C_ORANGE, edgecolor='white', linewidth=2)
    ax.add_patch(comp_rect)
    ax.text(2.05, 1.6, '[Compute]  实时计算层', fontsize=13, fontweight='bold', color='white')
    ax.text(2.05, 1.1, 'computeRelations()\nscoreRelations()', fontsize=9, color='white', alpha=0.9)

    # Right side: 2 engines
    # Engine 1: Decomposition
    eng1_rect = FancyBboxPatch((5.0, 4.0), 4.0, 2.5, boxstyle='round,pad=0.12',
                                facecolor='#FDF6F5', edgecolor=C_RED, linewidth=3)
    ax.add_patch(eng1_rect)
    ax.text(7.0, 6.0, '[Engine]  拆解引擎', fontsize=14, fontweight='bold', color=C_RED, ha='center')
    ax.text(7.0, 5.3, 'buildTree()\nannotateTypes()\ngetGhostAnnotation()\nratePhonetic()', fontsize=9.5, color=C_DARK, ha='center')
    ax.text(7.0, 4.2, '→ DecompositionGraph\n(D3 树形图)', fontsize=9.5, color=C_RED, ha='center', fontweight='bold')

    # Engine 2: Connection
    eng2_rect = FancyBboxPatch((9.6, 4.0), 4.0, 2.5, boxstyle='round,pad=0.12',
                                facecolor='#FDF8F0', edgecolor=C_ORANGE, linewidth=3)
    ax.add_patch(eng2_rect)
    ax.text(11.6, 6.0, '[Network]  系联网络', fontsize=14, fontweight='bold', color=C_ORANGE, ha='center')
    ax.text(11.6, 5.3, 'computeRelations()\nscoreRelations()\ndedupSimpTrad()\ntakeList()', fontsize=9.5, color=C_DARK, ha='center')
    ax.text(11.6, 4.2, '→ CognateGraph\n(D3 力导向图)', fontsize=9.5, color=C_ORANGE, ha='center', fontweight='bold')

    # Arrows from data layers to engines
    ax.annotate('', xy=(6.5, 5.85), xytext=(4.0, 5.85),
               arrowprops=dict(arrowstyle='->', color=C_RED, lw=2, connectionstyle='arc3,rad=0.15'))
    ax.annotate('', xy=(10.0, 5.85), xytext=(4.0, 5.85),
               arrowprops=dict(arrowstyle='->', color=C_ORANGE, lw=2, connectionstyle='arc3,rad=-0.15'))

    # Bottom: User interaction
    user_rect = FancyBboxPatch((5.0, 0.5), 8.6, 1.0, boxstyle='round,pad=0.08',
                                facecolor=C_DARK, edgecolor='white', linewidth=2)
    ax.add_patch(user_rect)
    ax.text(9.3, 1.0, '[ 用户交互：搜索汉字 → 查看拆解 → 点击声旁/形旁 → 探索关联字网络 → 拼拆游戏', fontsize=11, color='white', ha='center', fontweight='bold')

    fig.suptitle('LINES 字里行间 · 系统数据架构总览', fontsize=20, fontweight='bold', color=C_DARK, y=1.01)
    return save_chart(fig, '15_系统架构总览.png')


# ================================================================
# Run all charts
# ================================================================
if __name__ == '__main__':
    print('Generating visual charts...\n')
    chart1_architecture()
    chart2_six_books()
    chart3_pipeline()
    chart4_phonetic_rating()
    chart5_network_arch()
    chart6_nine_relations()
    chart7_dedup()
    chart8_radar()
    chart9_indices()
    chart10_comparison()
    chart11_full_pipeline()
    chart12_bloom()
    chart13_ghost_variants()
    chart14_simp_trad()
    chart15_system_overview()
    print(f'\nAll {15} charts saved to: {OUTPUT_DIR}')
