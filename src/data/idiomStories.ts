/**
 * 常见成语的「文化故事」（人工撰写，中英双语）。
 *
 * 用途：详情页「词语与典故」板块中，成语卡片除展示数据集自带的
 * 释义/出处/例句外，若在此表中命中，则额外展示一段可读性更强的文化故事。
 *
 * 撰写原则：交代出处与背景 → 叙述故事经过 → 点明寓意；避免字源、字理等专业内容。
 */
export interface IdiomStory {
  zh: string;
  en: string;
}

export const IDIOM_STORIES: Record<string, IdiomStory> = {
  守株待兔: {
    zh: '出自《韩非子·五蠹》。宋国有个农夫在田里耕作，一只兔子慌不择路撞在树桩上折颈而死。他白捡了兔子，从此放下农具，天天守在树桩旁等下一只兔子，结果兔子再没等到，田地也荒废了。这个故事告诉人们：把偶然的运气当成必然，坐等其成，终究一无所获。',
    en: 'From Han Feizi. A farmer in the state of Song saw a rabbit dash against a tree stump and break its neck. He picked it up for free, then abandoned his plough and waited by the stump every day for another rabbit. None came, and his fields went to waste. The story warns against mistaking a lucky accident for a sure thing and waiting idly for results.',
  },
  刻舟求剑: {
    zh: '出自《吕氏春秋·察今》。楚国人乘船渡江，佩剑不慎落水。他急忙在船舷上刻下记号，说"我的剑是从这里掉下去的"。船靠岸后，他按记号下水寻找，自然一无所获——船在走，剑却沉在原地不动。寓意做事不知变通，用静止的眼光看待变化的事物。',
    en: 'From Lüshi Chunqiu. A man of Chu was crossing a river when his sword fell overboard. He quickly carved a mark on the boat\'s side, saying, "My sword fell in right here." When the boat docked, he dived where the mark was — but the boat had moved while the sword lay still. The tale mocks those who cling to fixed rules in a changing world.',
  },
  画蛇添足: {
    zh: '出自《战国策·齐策》。楚国有人赏给门客一壶酒，人多酒少，便约定比赛画蛇，先画完的人喝酒。一人最先画好，端起酒壶却又得意地给蛇添上脚。这时另一人画完了，夺过酒壶说"蛇本无脚，你添的不是蛇"，把酒喝了。寓意做事多此一举，反而弄巧成拙。',
    en: 'From the Intrigues of the Warring States. A host gave his retainers one pot of wine, too little for all, so they agreed to race at drawing a snake. The first to finish took up the pot, but in his pride added feet to the snake. Another man then finished, seized the pot and said, "A snake has no feet — what you drew is not a snake," and drank it. Doing too much can ruin a good thing.',
  },
  亡羊补牢: {
    zh: '出自《战国策·楚策》。牧人丢了一只羊，邻居劝他修补羊圈，他不以为意。第二天又丢了一只，他才赶紧把窟窿堵上。从此羊再没丢过。后人评说：羊丢了再修圈，还不算太晚。寓意出了差错后及时补救，仍可避免更大的损失。',
    en: 'From the Intrigues of the Warring States. A shepherd lost a sheep; a neighbour urged him to mend the pen, but he brushed it off. After losing a second sheep he finally patched the hole, and lost no more. "Mend the pen after the sheep is lost — it is still not too late." The lesson: prompt repair after a mistake can still prevent worse losses.',
  },
  井底之蛙: {
    zh: '出自《庄子·秋水》。井里的青蛙对东海的大鳖夸耀自己独占一坑水、跳跃自如的快乐，觉得这就是天下至美。大鳖讲起东海的浩渺无垠，青蛙才惊觉自己的天地只有井口那么大。寓意眼界狭窄、见识短浅的人往往自以为是。',
    en: 'From Zhuangzi. A frog in a well boasted to a great sea turtle about his joy in a puddle of water, thinking his was the finest life in the world. The turtle described the vastness of the Eastern Sea, and the frog realised his world was no bigger than the mouth of the well. The fable mocks the narrow-minded who mistake their small world for the whole.',
  },
  掩耳盗铃: {
    zh: '出自《吕氏春秋·自知》。有人想偷一口大钟，怕敲碎时发出声响，便捂住自己的耳朵去砸钟，以为这样别人就听不见了。结果钟声大作，他被当场抓住。寓意自欺欺人——捂住自己的耳朵，并不能改变事实。',
    en: 'From Lüshi Chunqiu. A man tried to steal a great bronze bell. Fearing the noise of breaking it, he plugged his own ears and struck it, thinking no one else would hear. The bell rang out and he was caught on the spot. The tale mocks self-deception: covering your own ears does not change reality.',
  },
  自相矛盾: {
    zh: '出自《韩非子·难一》。楚国有个卖矛又卖盾的人，先夸盾坚不可摧，又夸矛无坚不摧。旁人问他："用你的矛刺你的盾，会怎样？"他无言以对。寓意言行前后抵触、不能自圆其说。',
    en: 'From Han Feizi. A seller of spears and shields boasted first that his shields could not be pierced, then that his spears could pierce anything. A bystander asked, "What happens if you strike your shield with your own spear?" He had no answer. The tale describes statements that contradict each other.',
  },
  塞翁失马: {
    zh: '出自《淮南子·人间训》。边塞老人家的马跑入胡地，邻人安慰他，他说："这未必不是福气。"不久马带回一匹胡地骏马；儿子骑马摔断了腿，他又说未必是祸。后来征兵，儿子因伤免役，保全了性命。寓意祸福相依，看事情不能只看一时。',
    en: 'From Huainanzi. An old frontiersman\'s horse ran off into barbarian lands. When neighbours offered sympathy he said, "This may not be a misfortune." The horse soon returned with a fine barbarian steed. His son fell and broke his leg, and again the old man said it might not be bad. When conscription came, the injured son was spared. Fortune and misfortune turn into each other.',
  },
  对牛弹琴: {
    zh: '出自汉代牟融《理惑论》。音乐家公明仪对着吃草的牛弹奏高雅的琴曲，牛却毫无反应，只顾低头吃草。并非琴曲不美，而是牛听不懂。寓意对不懂道理的人讲高深的道理，白费口舌。',
    en: 'From Mou Rong\'s Lidai Lun. The musician Gongming Yi played elegant music to an ox grazing in a field; the ox paid no attention and kept eating. The music was not poor — the ox simply could not understand it. The saying describes wasting fine words on someone unable to appreciate them.',
  },
  狐假虎威: {
    zh: '出自《战国策·楚策》。老虎抓住狐狸要吃它，狐狸说："天帝命我做百兽之王，你若吃我便是违命。不信跟我走一趟。"狐狸走在前面，野兽见了纷纷逃窜，老虎不知它们怕的是自己，还以为怕的是狐狸。寓意倚仗他人势力欺压别人。',
    en: 'From the Intrigues of the Warring States. A tiger caught a fox, which declared, "Heaven appointed me king of beasts; to eat me is to defy Heaven. Walk behind me and see." The beasts fled at their approach, and the tiger, not realising they feared him, thought they feared the fox. The phrase means to bully others by borrowed power.',
  },
  揠苗助长: {
    zh: '出自《孟子·公孙丑上》。宋国人嫌田里的禾苗长得太慢，便一棵棵把它们拔高。他疲惫地回家说"今天我帮禾苗长高了"，儿子跑去一看，禾苗全都枯死了。寓意违背事物规律、急于求成，反而把事情弄坏。',
    en: 'From Mencius. A man of Song thought his seedlings grew too slowly, so he pulled each one upward. Exhausted, he went home saying, "I helped the sprouts grow today." His son ran out to find them all withered. Rushing results by breaking the natural order destroys the very thing you want.',
  },
  叶公好龙: {
    zh: '出自汉代刘向《新序·杂事》。叶公极爱龙，屋里屋外画满龙纹。天上的真龙听说后前来拜访，把头探进窗户，尾巴拖在厅堂。叶公一见，吓得魂飞魄散，转身就跑。寓意表面爱好某事物，实则并非真心。',
    en: 'From Liu Xiang\'s Xinxu. Lord Ye loved dragons so much that he covered his house with dragon designs. Hearing of this, a real dragon came to visit, poking its head through the window and trailing its tail in the hall. Lord Ye fled in terror. The phrase describes professed enthusiasm that proves hollow when put to the test.',
  },
  杯弓蛇影: {
    zh: '出自《晋书·乐广传》。乐广请客饮酒，客人见杯中似有一条蛇，勉强喝下后便病倒了。后来发现那只是墙上弓弩的倒影。乐广说明缘由，客人的病立刻痊愈。寓意疑神疑鬼，自相惊扰。',
    en: 'From the History of Jin. Le Guang\'s guest saw what looked like a snake in his wine cup, drank anyway, and fell ill. It turned out to be the reflection of a bow hanging on the wall. When Le Guang explained, the guest recovered at once. The phrase means to frighten oneself with imaginary fears.',
  },
  望梅止渴: {
    zh: '出自《世说新语·假谲》。曹操率军行军，途中缺水，士兵口渴难耐。曹操传令说："前面有大片梅林，梅子又酸又甜。"将士们想到梅子，口中生津，暂时解了渴。寓意用空想或虚幻的希望安慰自己或他人。',
    en: 'From A New Account of Tales of the World. On a march with no water, Cao Cao\'s thirsty soldiers were flagging. He announced, "Ahead lies a great plum grove, its fruit sour and sweet." Thinking of plums made their mouths water and eased their thirst for a while. The phrase means to comfort oneself with an illusion.',
  },
  画龙点睛: {
    zh: '出自唐代张彦远《历代名画记》。画家张僧繇在壁上画了四条龙，却不肯点眼睛，说一点睛龙就会飞走。众人不信，请他点上。笔刚落，雷电交加，两条龙破壁腾空而去。寓意在关键处点明要旨，使整件事一下子生动起来。',
    en: 'From Zhang Yanyuan\'s Famous Paintings of Successive Dynasties. The painter Zhang Sengyou drew four dragons on a wall but refused to dot their eyes, saying they would fly away. Pressed by onlookers, he dotted two — thunder cracked and those dragons soared off through the wall. The phrase means a final touch that brings the whole work to life.',
  },
  一鸣惊人: {
    zh: '出自《史记·滑稽列传》。楚庄王即位三年不理朝政，还下令禁止进谏。大臣以隐语进言："有只鸟停在山上，三年不飞不鸣，是什么鸟？"庄王答："不飞则已，一飞冲天；不鸣则已，一鸣惊人。"此后他整顿朝政，终成霸业。寓意平时默默无闻，一旦施展便成就惊人。',
    en: 'From the Records of the Grand Historian. King Zhuang of Chu spent three years on the throne without governing. A minister hinted, "A bird sits on a hill three years without flying or crying — what bird is it?" The king replied, "If it does not fly, it soars to the sky; if it does not cry, it startles the world." He then reformed the state and became a hegemon.',
  },
  三顾茅庐: {
    zh: '出自《三国志·诸葛亮传》。刘备听闻诸葛亮有经天纬地之才，先后三次到隆中草庐拜访。前两次都没见到人，第三次终于得见，诸葛亮为他分析天下大势，提出"隆中对"。刘备的诚意打动了诸葛亮，从此君臣相得。寓意诚心诚意地一再邀请贤才。',
    en: 'From the Records of the Three Kingdoms. Hearing of Zhuge Liang\'s genius, Liu Bei travelled three times to his thatched cottage in Longzhong. Twice he found no one; on the third visit they met, and Zhuge Liang laid out his grand strategy for the realm. Sincere persistence won over a great talent.',
  },
  卧薪尝胆: {
    zh: '出自《史记·越王勾践世家》。越王勾践被吴王夫差打败后，忍辱为奴三年。回国后，他睡在柴草上，屋里挂着苦胆，吃饭前先尝一口，提醒自己不忘亡国之耻。经过十年生聚、十年教训，终于灭掉吴国。寓意刻苦自励、发愤图强。',
    en: 'From the Records of the Grand Historian. Defeated by King Fuchai of Wu, King Goujian of Yue endured three years as a slave. Back home he slept on brushwood and hung a gall bladder in his room, tasting its bitterness before every meal to remember his humiliation. After years of rebuilding, he destroyed Wu. The phrase means to endure hardship to strengthen resolve.',
  },
  破釜沉舟: {
    zh: '出自《史记·项羽本纪》。项羽率军渡河救赵，过河后下令凿沉船只、砸破炊具、烧毁营房，只带三日口粮，以示有进无退。将士们因此拼死作战，大破秦军。寓意下定决心，不留退路，全力以赴。',
    en: 'From the Records of the Grand Historian. Crossing the river to relieve Zhao, Xiang Yu ordered his boats scuttled, his cauldrons smashed and his camps burned, taking only three days\' rations — no way back. His troops fought to the death and shattered the Qin army. The phrase means to commit utterly, leaving no retreat.',
  },
  完璧归赵: {
    zh: '出自《史记·廉颇蔺相如列传》。秦昭王愿以十五座城换赵国的和氏璧，蔺相如奉命带璧入秦。见秦王并无诚意割城，他便以璧有瑕疵为由取回玉璧，举璧倚柱，声称若强夺便撞碎玉璧，最终派人把璧完好送回赵国。寓意不辱使命、原物归还。',
    en: 'From the Records of the Grand Historian. When Qin offered fifteen cities for Zhao\'s jade disc, Lin Xiangru carried it to Qin. Seeing the king had no intention of ceding land, he reclaimed the disc by claiming a flaw, held it against a pillar and threatened to smash it, then smuggled it home intact. The phrase means to return something unharmed while fulfilling one\'s mission.',
  },
  负荆请罪: {
    zh: '出自《史记·廉颇蔺相如列传》。大将廉颇不服蔺相如位在自己之上，扬言要羞辱他。蔺相如为顾全国家大局，处处避让。廉颇得知后深受感动，赤膊背着荆条到蔺相如门前请罪，两人结为刎颈之交。寓意主动认错、真诚赔礼。',
    en: 'From the Records of the Grand Historian. General Lian Po resented Lin Xiangru\'s higher rank and vowed to humiliate him; Lin avoided him for the sake of the state. Moved when he learned why, Lian Po came bare-backed carrying thorn twigs to Lin\'s door to beg forgiveness, and the two became sworn friends. The phrase means to offer a sincere apology.',
  },
  纸上谈兵: {
    zh: '出自《史记·廉颇蔺相如列传》。赵括自幼熟读兵书，谈起兵法头头是道，连父亲赵奢也难不倒他。但他只会空谈，不懂实战。长平之战中他取代廉颇领兵，贸然出击，被秦军围困，四十余万赵军覆没。寓意空谈理论，不能解决实际问题。',
    en: 'From the Records of the Grand Historian. Zhao Kuo had read every military text and could argue strategy brilliantly — even his father could not out-talk him — yet he knew nothing of real war. Given command at Changping, he attacked rashly, was encircled by Qin, and lost over four hundred thousand men. The phrase means to talk theory without practice.',
  },
  四面楚歌: {
    zh: '出自《史记·项羽本纪》。项羽被汉军围困在垓下，夜里听见四面都唱起楚地的歌谣，大惊道："汉军已经占领楚地了吗？为什么楚人这么多！"军心涣散，士气崩溃，项羽最终自刎乌江。寓意陷入孤立无援的困境。',
    en: 'From the Records of the Grand Historian. Surrounded at Gaixia, Xiang Yu heard songs of Chu rising on every side and cried, "Has Han taken all of Chu? Why so many men of Chu!" His army\'s spirit broke and he finally took his own life by the Wu River. The phrase means to be utterly isolated with no help at hand.',
  },
  指鹿为马: {
    zh: '出自《史记·秦始皇本纪》。秦二世时，丞相赵高牵来一只鹿，硬说是一匹马，借以试探群臣。说是鹿的人后来都被他陷害，附和说是马的人则得以保全。从此朝中再无人敢违逆他。寓意颠倒黑白、混淆是非。',
    en: 'From the Records of the Grand Historian. Chancellor Zhao Gao brought a deer before the Second Emperor of Qin and insisted it was a horse, testing the court. Those who called it a deer were later persecuted; those who agreed it was a horse survived. No one dared oppose him thereafter. The phrase means to call black white.',
  },
  唇亡齿寒: {
    zh: '出自《左传·僖公五年》。晋国向虞国借道去攻打虢国，虞国大夫宫之奇劝谏说："虢国是虞国的屏障，虢国亡了，虞国必然跟着灭亡，就像嘴唇没有了，牙齿就会感到寒冷。"虞君不听，晋国灭虢后回师便灭了虞国。寓意双方利害相关，休戚与共。',
    en: 'From the Zuo Commentary. When Jin asked leave to pass through Yu to attack Guo, the minister Gong Zhiqi warned, "Guo is Yu\'s shield; if Guo falls, Yu falls too — as when the lips are gone, the teeth feel cold." The ruler ignored him; after destroying Guo, Jin turned back and took Yu. The phrase means shared interests and mutual dependence.',
  },
  滥竽充数: {
    zh: '出自《韩非子·内储说上》。齐宣王喜欢听三百人一起吹竽，南郭先生不会吹，却混在乐队里装模作样。宣王死后，湣王喜欢听独奏，南郭先生只好逃走。寓意没有真才实学却混在行家里充数。',
    en: 'From Han Feizi. King Xuan of Qi loved hearing three hundred men play the yu together; Mr. Nanguo, who could not play, bluffed his way into the band. When King Min, who preferred solos, took the throne, Nanguo fled. The phrase means to pass oneself off among experts without real skill.',
  },
  惊弓之鸟: {
    zh: '出自《战国策·楚策》。射手更羸对魏王说，他不用箭，只拉弓弦就能射下飞鸟。恰有一只大雁飞来，他一拉弦，雁便应声坠落。原来那雁受过箭伤，伤口未愈，听见弦响便惊慌高飞，旧伤迸裂而落。寓意受过惊吓的人，遇到相似情形便格外恐慌。',
    en: 'From the Intrigues of the Warring States. The archer Geng Lei told the King of Wei he could bring down a bird with the twang of his bowstring alone. When a wild goose flew over, he plucked the string and it fell. The goose had an unhealed wound; startled by the sound, it flew up in panic and its old injury burst. The phrase means someone made fearful by past experience.',
  },
  南辕北辙: {
    zh: '出自《战国策·魏策》。有人要去南方的楚国，却驾着车向北走。旁人提醒他方向错了，他说自己马好、钱多、车夫善驭。可方向不对，条件越好，只会离目标越远。寓意行动与目的背道而驰。',
    en: 'From the Intrigues of the Warring States. A man heading for Chu in the south drove his carriage northward. Warned that he was going the wrong way, he boasted of his fine horse, ample funds and skilled driver. But with the wrong direction, better means only carry you further from your goal. The phrase means means and ends pulling in opposite directions.',
  },
  邯郸学步: {
    zh: '出自《庄子·秋水》。燕国有个少年到赵国的都城邯郸，见那里的人走路姿势优美，便跟着学。结果不但没学会，连自己原来怎么走也忘了，只好爬着回去。寓意盲目模仿别人，反而丧失了自己的长处。',
    en: 'From Zhuangzi. A young man from Yan went to Handan, capital of Zhao, and tried to imitate the elegant way its people walked. He never mastered it and forgot his own gait, so he crawled home. The phrase warns that blind imitation can cost you your own strengths.',
  },
  东施效颦: {
    zh: '出自《庄子·天运》。美女西施有心口痛的毛病，皱眉捂胸的样子也很动人。同村的丑女东施见了，也学着皱眉捂胸，结果更显丑陋，人人避之不及。寓意不了解别人的长处何在，盲目模仿只会适得其反。',
    en: 'From Zhuangzi. The beauty Xi Shi, troubled by chest pains, looked lovely even when she frowned and pressed her hand to her heart. A plain woman of the same village, Dong Shi, imitated the frown and gesture — and only looked uglier. The phrase warns that copying without understanding the reason makes things worse.',
  },
  愚公移山: {
    zh: '出自《列子·汤问》。年近九十的愚公不满两座大山挡在家门口，带领子孙挖山不止，说"子子孙孙无穷匮也，而山不加增，何苦而不平"。邻居智叟嘲笑他，他毫不动摇。天帝被他的决心感动，命人把两座山搬走。寓意只要坚持不懈，终能克服困难。',
    en: 'From Liezi. Nearing ninety, Yu Gong wearied of the two mountains blocking his door and led his sons to dig them away. "My descendants will never run out, but the mountains will not grow — why can they not be levelled?" He ignored a neighbour\'s mockery, and Heaven, moved by his resolve, had the mountains removed. Persistence can overcome any obstacle.',
  },
  精卫填海: {
    zh: '出自《山海经·北山经》。炎帝的小女儿女娃到东海游玩，溺水而死，化作一只名叫精卫的鸟。它日复一日从西山衔来树枝和石子，投入东海，誓要把大海填平。寓意意志坚定、矢志不渝，哪怕希望渺茫也不放弃。',
    en: 'From the Classic of Mountains and Seas. Nüwa, youngest daughter of the Yan Emperor, drowned while playing in the Eastern Sea and became a bird called Jingwei. Day after day she carried twigs and pebbles from the western hills and dropped them into the sea, vowing to fill it. The phrase means unshakeable resolve against hopeless odds.',
  },
  夸父逐日: {
    zh: '出自《山海经·海外北经》。巨人夸父立志追赶太阳，一路狂奔，追到太阳落下的地方。他口渴难耐，喝干了黄河和渭水，仍不够，赶往北方大泽时渴死在途中。他丢弃的手杖化成一片桃林，为后来的人遮荫解渴。寓意志向远大、勇于追求。',
    en: 'From the Classic of Mountains and Seas. The giant Kuafu set out to chase the sun, running until he reached the place where it sets. Parched, he drained the Yellow River and the Wei, and died of thirst on his way to the great northern marsh. His discarded staff became a peach grove that shaded and refreshed those who came after. The phrase praises lofty ambition.',
  },
  嫦娥奔月: {
    zh: '出自《淮南子·览冥训》。后羿射下九个太阳，为民除害，从西王母处得到不死之药。他的妻子嫦娥吞下药后，身子飘起，飞向月宫。后人为纪念她，在中秋之夜赏月、设供。这个故事寄托了古人对月亮的想象与对团圆的期盼。',
    en: 'From Huainanzi. Hou Yi shot down nine suns to save the people and obtained an elixir of immortality. His wife Chang\'e swallowed it and floated up to the moon palace. Ever since, people have gazed at the moon and made offerings on mid-autumn night. The tale carries ancient imaginings of the moon and a longing for reunion.',
  },
  女娲补天: {
    zh: '出自《淮南子·览冥训》。远古时天柱折断，天塌地陷，大火蔓延，洪水泛滥，猛兽食人。女娲炼五色石补好苍天的缺口，斩下巨龟的四足撑起四极，平息洪水，杀死猛兽，使人民得以安居。寓意挺身而出、拯救危难。',
    en: 'From Huainanzi. In high antiquity the pillar of heaven broke, the sky cracked, fires raged, floods spread and beasts devoured people. Nüwa melted five-coloured stones to patch the sky, cut the legs of a giant turtle to prop up the four corners, quelled the floods and slew the beasts, restoring peace. The phrase means to step forward and save others from disaster.',
  },
  名落孙山: {
    zh: '出自宋代范公偁《过庭录》。孙山参加科举考试，名列榜上最后一名。同乡问他自己儿子考得如何，孙山委婉答道："解名尽处是孙山，贤郎更在孙山外。"意思是榜上最后一名是我，令郎还在我后面。后来便用"名落孙山"指考试或选拔未被录取。',
    en: 'From Fan Gongcheng\'s Guoting Lu. Sun Shan passed the imperial examination last on the list. Asked about a neighbour\'s son, he answered tactfully, "At the very end of the list is Sun Shan; your worthy son is beyond Sun Shan." That is, the last name was his, and the neighbour\'s son ranked below. The phrase now means to fail an exam or selection.',
  },
  程门立雪: {
    zh: '出自《宋史·杨时传》。杨时和游酢去拜见老师程颐，恰逢程颐闭目养神。两人不敢惊动，恭敬地站在门外等候。程颐醒来时，门外的雪已经积了一尺深。后人用这个故事形容尊师重道、求学诚恳。',
    en: 'From the History of Song. Yang Shi and You Zuo called on their teacher Cheng Yi, who was resting with his eyes closed. Unwilling to disturb him, they waited respectfully outside. When Cheng Yi woke, the snow at the door was a foot deep. The story is told to praise reverence for teachers and earnestness in learning.',
  },
  凿壁偷光: {
    zh: '出自《西京杂记》。西汉的匡衡家境贫寒，买不起蜡烛。他在墙上凿了一个小洞，借邻家透过来的灯光读书。凭着这份刻苦，他终成一代学者，官至丞相。寓意在困境中仍勤奋好学。',
    en: 'From the Miscellaneous Records of the Western Capital. Kuang Heng of the Western Han was too poor to buy lamp oil, so he chiselled a hole in the wall to read by his neighbour\'s light. Through such diligence he became a great scholar and rose to chancellor. The phrase praises hard study despite poverty.',
  },
  悬梁刺股: {
    zh: '这是两个苦读的故事合称。东汉孙敬读书时把头发系在屋梁上，一打瞌睡就会被扯醒；战国苏秦读书困倦时，用锥子刺自己的大腿提神。两人都凭这种狠劲学有所成。寓意发愤苦读、自我鞭策。',
    en: 'A pairing of two tales of hard study. Sun Jing of the Eastern Han tied his hair to a roof beam so that dozing would jerk him awake; Su Qin of the Warring States pricked his thigh with an awl to stay alert. Both achieved great things through such self-discipline. The phrase means to study with fierce determination.',
  },
  囊萤映雪: {
    zh: '这是两个勤学故事合称。东晋车胤家贫无油，夏天用白绢袋装萤火虫照明读书；晋代孙康冬夜借雪地反射的月光读书。两人都在艰苦条件下坚持学习。寓意家境贫寒仍不废学业。',
    en: 'Another pairing. Che Yin of the Eastern Jin, too poor for lamp oil, read by the light of fireflies he gathered in a gauze bag; Sun Kang read by the moonlight reflected off the snow. Both persevered under harsh conditions. The phrase praises study that overcomes poverty.',
  },
  闻鸡起舞: {
    zh: '出自《晋书·祖逖传》。祖逖与好友刘琨同住，半夜听见鸡鸣，祖逖踢醒刘琨说："这不是恶声！"两人便起床舞剑练武。后来祖逖成为收复中原的名将。寓意志士及时奋发，刻苦自励。',
    en: 'From the History of Jin. Sharing a room, Zu Ti and Liu Kun heard a cock crow at midnight. Zu Ti kicked his friend awake: "That is no ill omen!" They rose and practised swordplay. Zu Ti later became a famous general who fought to recover the Central Plain. The phrase means to rouse oneself to diligent effort.',
  },
  铁杵成针: {
    zh: '出自宋代祝穆《方舆胜览》。相传李白年少时读书不用功，一次在山中遇见一位老妇，正拿着铁杵在石上磨。李白问她做什么，老妇说："我要把它磨成一根针。"李白深受触动，从此发愤读书。寓意只要功夫深，终能有所成就。',
    en: 'From Zhu Mu\'s Fangyu Shenglan. As a boy, Li Bai was a lazy student until he met an old woman grinding an iron pestle on a stone. Asked what she was doing, she replied, "I mean to grind it into a needle." Stirred by her patience, he applied himself to study. With enough effort, anything can be accomplished.',
  },
  熟能生巧: {
    zh: '出自宋代欧阳修《归田录》。陈尧咨善射，自矜其能。卖油翁看后只是微微点头。陈尧咨不服，卖油翁便取一铜钱覆在葫芦口上，从钱孔中注油，油从孔过而钱不湿，说："我也没有别的本事，只是手熟罢了。"寓意勤加练习，自然纯熟。',
    en: 'From Ouyang Xiu\'s Guitian Lu. Chen Yaozi was proud of his archery, but an old oil seller only nodded. Challenged, the old man set a copper coin over the mouth of a gourd and poured oil through its square hole without wetting the coin: "I have no special skill — only a practised hand." Skill comes from repeated practice.',
  },
  水滴石穿: {
    zh: '出自宋代罗大经《鹤林玉露》。崇阳县令张乖崖见一名库吏偷了一枚钱，判以重罚。库吏不服，说不过一枚钱而已。张乖崖提笔批道："一日一钱，千日千钱，绳锯木断，水滴石穿。"寓意力量虽小，只要坚持不懈，也能成就大事。',
    en: 'From Luo Dajing\'s Helin Yulu. When a clerk stole a single coin from the treasury, magistrate Zhang Guaiya punished him severely. Protesting that it was only one coin, the clerk received the verdict: "A coin a day makes a thousand in a thousand days; a rope saws through wood, dripping water wears through stone." Small persistent efforts achieve great results.',
  },
  锲而不舍: {
    zh: '出自《荀子·劝学》。荀子用雕刻作比："锲而舍之，朽木不折；锲而不舍，金石可镂。"意思是雕刻几下就放弃，连朽木也刻不断；坚持不停地刻，金属和石头也能雕出花纹。寓意坚持不懈、始终不放弃。',
    en: 'From Xunzi\'s Encouragement to Learn. Xunzi compared learning to carving: "Stop after a few cuts and even rotten wood will not break; keep carving without letting up and even metal and stone can be engraved." The phrase means to persevere without giving up.',
  },
  专心致志: {
    zh: '出自《孟子·告子上》。弈秋是全国最善下棋的人，他教两个人下棋，一人专心听讲，另一人却想着天上有天鹅飞来，好拉弓去射。两人虽然一起学习，成绩却相差很远。孟子说，这不是智力差别，而是专心与否。寓意集中精神、心无旁骛。',
    en: 'From Mencius. Yi Qiu, the finest chess player in the land, taught two pupils. One listened intently; the other kept thinking of swans overhead and reaching for his bow. Though they studied together, their progress differed greatly — not from intelligence, said Mencius, but from concentration. The phrase means single-minded focus.',
  },
  手不释卷: {
    zh: '出自《三国志·吴书·吕蒙传》注引《江表传》。孙权劝大将吕蒙多读书，吕蒙以军务繁忙推辞。孙权说自己也常读书，获益匪浅。吕蒙从此发奋，读的书连老儒生都比不上。鲁肃再见他时惊叹："你已不是当年吴下的阿蒙了。"寓意勤奋好学、书不离手。',
    en: 'From the Records of the Three Kingdoms. Sun Quan urged General Lü Meng to study; pleading military duties, Lü demurred until Sun Quan noted that he himself read constantly and gained much. Lü then studied so hard that scholars could not match him, and Lu Su exclaimed, "You are no longer the Lü Meng of old!" The phrase means to keep studying without putting the book down.',
  },
  学富五车: {
    zh: '出自《庄子·天下》。庄子评述惠施时说"惠施多方，其书五车"，意思是惠施学问广博，他读过的书能装满五辆车子。在竹简书写的年代，五车书已是惊人的数量。后人便用"学富五车"形容人读书多、学问大。',
    en: 'From Zhuangzi. Describing Hui Shi, Zhuangzi wrote that "his methods were many and his books five cartloads" — in an age of bamboo slips, an astonishing library. The phrase is used to describe a person of vast reading and deep learning.',
  },
  胸有成竹: {
    zh: '出自宋代苏轼《文与可画筼筜谷偃竹记》。画家文与可画竹之前，心中早已有了竹子的完整形象，所以落笔时一挥而就。苏轼说这是"画竹必先得成竹于胸中"。寓意做事之前已有周密考虑和把握。',
    en: 'From Su Shi\'s essay on Wen Yuke\'s bamboo paintings. Before painting, Wen Yuke already held a complete image of the bamboo in his mind, so his brush moved freely. Su Shi wrote that one must "have the finished bamboo in the breast" before painting. The phrase means to act with a clear plan and full confidence.',
  },
  举一反三: {
    zh: '出自《论语·述而》。孔子说："举一隅不以三隅反，则不复也。"意思是教给学生一个角，他若不能由此推知其余三个角，就不再往下教了。强调学习要能触类旁通、由此及彼。',
    en: 'From the Analects. Confucius said, "If I raise one corner and the student cannot come back with the other three, I do not repeat the lesson." Learning, he taught, means drawing inferences and applying one case to many.',
  },
  不耻下问: {
    zh: '出自《论语·公冶长》。孔子评价卫国大夫孔圉"敏而好学，不耻下问"，因此赐他谥号"文"。意思是孔圉聪敏好学，向地位或学问不如自己的人请教也不觉得羞耻。寓意虚心求教、不以问人为耻。',
    en: 'From the Analects. Confucius praised the minister Kong Yu as "quick and fond of learning, not ashamed to ask those beneath him," which earned him the posthumous title "Wen." The phrase means to seek knowledge humbly, unashamed to learn from anyone.',
  },
  教学相长: {
    zh: '出自《礼记·学记》。"学然后知不足，教然后知困。知不足，然后能自反也；知困，然后能自强也。故曰教学相长也。"意思是学习才知道自己的不足，教人才知道自己的困惑，教与学互相促进、共同提高。',
    en: 'From the Book of Rites. "Learning reveals one\'s shortcomings; teaching reveals one\'s confusions. Knowing these, one turns inward and strengthens oneself — thus teaching and learning promote each other." The phrase means that instructing others also advances one\'s own understanding.',
  },
  孟母三迁: {
    zh: '出自汉代刘向《列女传》。孟子的母亲起初住在墓地旁，孟子学着办丧事；搬到市集旁，孟子又学商人叫卖；最后搬到学宫旁，孟子开始学习礼仪。孟母说"这才是适合孩子住的地方"，便定居下来。寓意环境对成长影响深远，父母应重视择邻。',
    en: 'From Liu Xiang\'s Biographies of Exemplary Women. Mencius\'s mother first lived by a graveyard, where he imitated funerals; then by a market, where he mimicked hawkers; at last by a school, where he took up rites and learning. "This is the right place for my child," she said, and settled there. Environment shapes a child\'s growth.',
  },
  孔融让梨: {
    zh: '出自《后汉书·孔融传》注引《融家传》。孔融四岁时，与兄弟们一起吃梨，他总是挑最小的拿。大人问他为什么，他答："我年纪小，应当拿小的。"家族上下都感到惊奇。寓意谦让有礼、懂得尊长爱幼。',
    en: 'From the History of the Later Han. At four years old, Kong Rong always took the smallest pear when sharing with his brothers. Asked why, he said, "I am the youngest, so I should take the small one." The whole clan marvelled. The story praises modesty and courtesy.',
  },
  卧冰求鲤: {
    zh: '出自《搜神记》。王祥的继母在寒冬想吃活鱼，王祥便解开衣服卧在冰面上，想用体温化冰求鱼。冰忽然自行裂开，两条鲤鱼跃出。后人把这个故事列为孝行典范。寓意至诚之心可以感动天地，也寄托了对孝道的推崇。',
    en: 'From the Records of Searching for the Supernatural. When his stepmother craved fresh fish in midwinter, Wang Xiang stripped off his clothes and lay on the ice to melt it with his body heat. The ice split of itself and two carp leapt out. The tale is told as a model of filial devotion.',
  },
  温故知新: {
    zh: '出自《论语·为政》。孔子说："温故而知新，可以为师矣。"意思是温习学过的知识，又能从中获得新的体会和发现，这样的人就可以做老师了。强调复习不是简单重复，而是深化理解。',
    en: 'From the Analects. Confucius said, "Reviewing what is old and thereby learning what is new — such a one may be a teacher." Revision, he taught, is not mere repetition but a path to deeper insight.',
  },
  学而不厌: {
    zh: '出自《论语·述而》。孔子自述："默而识之，学而不厌，诲人不倦，何有于我哉？"意思是默默记在心里，学习从不满足，教导别人从不疲倦。后人用"学而不厌"形容好学不倦、永不满足的精神。',
    en: 'From the Analects. Confucius described himself: "To silently treasure up knowledge, to learn without ever being satisfied, to teach others without growing weary — what difficulty have I in these?" The phrase means an insatiable love of learning.',
  },
  融会贯通: {
    zh: '出自宋代朱熹《朱子全书》。朱熹论读书之法时说，要"举一而三反，闻一而知十"，做到"学者用功之深，穷理之熟，然后能融会贯通"。意思是把各方面的知识和道理融合起来，得到全面透彻的理解。',
    en: 'From Zhu Xi\'s Complete Works. On reading, Zhu Xi urged learners to "infer three from one and know ten from one," so that deep effort and thorough inquiry would let them "blend and penetrate" the material. The phrase means to integrate knowledge into a coherent whole.',
  },
  循序渐进: {
    zh: '出自宋代朱熹《朱子语类》。朱熹谈读书方法说："读书之法，在循序而渐进，熟读而精思。"意思是按一定的次序、由浅入深地逐步推进，不能急于求成。寓意学习做事都要遵循规律、稳步前进。',
    en: 'From Zhu Xi\'s Classified Conversations. "The method of reading," he said, "lies in proceeding in order and advancing step by step, reading thoroughly and thinking carefully." The phrase means to progress steadily in due order rather than rushing.',
  },
  因材施教: {
    zh: '源自《论语》中孔子的教学实践，朱熹集注概括为"孔子教人，各因其材"。子路和冉有问同一个问题"闻斯行诸"，孔子对好勇的子路说要先请示父兄，对谦退的冉有则说应当立刻去做。同样的疑问，因学生性情不同而给出不同答案，这就是因材施教。',
    en: 'Drawn from Confucius\'s teaching as summarised by Zhu Xi: "Confucius taught each according to his material." When Zilu and Ran You asked the same question — "Should one act at once on hearing what is right?" — Confucius told the bold Zilu to consult his elders, but urged the retiring Ran You to act immediately. Different natures call for different guidance.',
  },
  一鼓作气: {
    zh: '出自《左传·庄公十年》曹刿论战。曹刿说："夫战，勇气也。一鼓作气，再而衰，三而竭。"齐鲁长勺之战中，他等齐军擂过三通鼓、士气衰落之后才让鲁军出击，一举获胜。寓意趁劲头正足时一口气把事情做完。',
    en: 'From the Zuo Commentary. In the battle of Changshao, Cao Gui said, "Battle depends on courage: at the first drum-beat it rises, at the second it flags, at the third it is spent." He waited until Qi had beaten its drums three times, then struck and won. Do a thing in one burst of energy.',
  },
  退避三舍: {
    zh: '出自《左传·僖公二十三年》。晋公子重耳流亡楚国时，许诺若将来两国交战，必"退避三舍"（九十里）以报礼遇。城濮之战中，晋文公果然退军九十里，诱敌深入而大胜。后指主动退让、避开锋芒。',
    en: 'From the Zuo Commentary. While in exile in Chu, Prince Chong\'er promised that should the two states ever fight he would "retreat three marches" (ninety li) in return for Chu\'s kindness. At the battle of Chengpu he did so, luring the enemy in and winning. It means to yield ground deliberately.',
  },
  一箭双雕: {
    zh: '出自《北史·长孙晟传》。长孙晟箭术精绝，见两只大雕争抢一块肉，便一箭射去，竟贯穿双雕。后人用"一箭双雕"形容做一件事同时达到两个目的。',
    en: 'From the History of the Northern Dynasties. The archer Zhangsun Sheng saw two great eagles fighting over a piece of meat; a single arrow pierced both. The phrase means to achieve two ends with one action.',
  },
  买椟还珠: {
    zh: '出自《韩非子·外储说左上》。楚国人到郑国卖珍珠，用名贵的木兰木做匣子，还熏香、缀上美玉。郑国人买了匣子，却把里面的珍珠退还。寓意取舍失当，只看外表而丢掉真正贵重的东西。',
    en: 'From Han Feizi. A man of Chu sold a pearl to a man of Zheng in a box of fragrant magnolia wood, scented and studded with jade. The buyer kept the box and returned the pearl. The tale mocks those who mistake ornament for substance.',
  },
  缘木求鱼: {
    zh: '出自《孟子·梁惠王上》。孟子劝齐宣王不要凭武力称霸，说这样做"犹缘木而求鱼也"——好比爬到树上去捉鱼，方向方法错了，再费力也徒劳无功。',
    en: 'From Mencius. Urging King Xuan of Qi not to seek supremacy by force, Mencius said it was "like climbing a tree to catch fish" — a wrong method makes effort futile.',
  },
  朝三暮四: {
    zh: '出自《庄子·齐物论》。养猴人分橡实给猴子，先说"早上三升、晚上四升"，猴子大怒；改口说"早上四升、晚上三升"，猴子便转怒为喜。总数未变，只是换了说法。后指玩弄手法欺骗人，也指反复无常。',
    en: 'From Zhuangzi. A monkey-keeper offered three measures of acorns in the morning and four at night; the monkeys raged. He then said four in the morning and three at night, and they were delighted. The total was unchanged. It means to deceive by juggling words, or to be fickle.',
  },
  鹬蚌相争: {
    zh: '出自《战国策·燕策二》。河蚌张开壳在岸上晒太阳，鹬鸟去啄它的肉，蚌合上壳夹住鹬嘴，两者互不相让。渔翁走来，把它们一起捉走。寓意双方相持不下，反让第三者得利。',
    en: 'From the Intrigues of the Warring States. A clam opened its shell to sun itself; a snipe pecked at its flesh and the clam clamped the bird\'s beak shut. Neither would yield, and a fisherman carried them both off. When two parties deadlock, a third profits.',
  },
  螳臂当车: {
    zh: '出自《庄子·人间世》。螳螂见到车轮滚来，竟举起前臂想把它挡住，自恃力大却不知自己根本挡不住。后人用"螳臂当车"比喻不自量力。',
    en: 'From Zhuangzi. A mantis raised its forelegs to stop a rolling chariot, overrating its own strength. The phrase means to overreach oneself.',
  },
  黔驴技穷: {
    zh: '出自唐代柳宗元《三戒·黔之驴》。贵州本没有驴，有人运来一头。老虎初见这庞然大物，十分畏惧；后来发现它只会踢腿，摸清了底细便扑上去把它吃掉。寓意有限的本领一旦用完，就再也无计可施。',
    en: 'From Liu Zongyuan\'s Three Fables. Guizhou had no donkeys until one was brought in. The tiger feared the huge creature at first, but finding it could only kick, soon learned its measure and killed it. Limited tricks run out.',
  },
  杞人忧天: {
    zh: '出自《列子·天瑞》。杞国有个人担心天会塌下来、地会陷下去，愁得吃不下饭、睡不着觉。有人开导他，说天是气聚成、地是土积成，他才放下心来。寓意毫无必要的忧虑。',
    en: 'From Liezi. A man of Qi worried that the sky might fall and the earth cave in, and could neither eat nor sleep. When told the sky is gathered air and the earth piled soil, he was comforted. The phrase means groundless anxiety.',
  },
  曲高和寡: {
    zh: '出自战国宋玉《对楚王问》。宋玉说，有人在郢都唱歌，唱通俗的《下里巴人》时数千人跟着和唱；唱高雅的《阳春白雪》时，能和的不过数十人。寓意言论或作品越深奥，理解的人越少。',
    en: 'From Song Yu\'s reply to the King of Chu. A singer in Ying had thousands join the chorus of a popular tune, but only a few dozen could follow a refined one. The loftier the work, the fewer who appreciate it.',
  },
  高山流水: {
    zh: '出自《列子·汤问》。伯牙弹琴，心里想着高山，钟子期便说"巍巍乎若泰山"；想着流水，子期又说"洋洋乎若江河"。子期死后，伯牙摔琴绝弦，终身不再弹奏。比喻知音难遇。',
    en: 'From Liezi. When Boya played thinking of mountains, Zhong Ziqi said, "Lofty as Mount Tai"; thinking of rivers, "Vast as flowing waters." After Ziqi died, Boya smashed his lute and never played again — a true friend is hard to find.',
  },
  韦编三绝: {
    zh: '出自《史记·孔子世家》。孔子晚年喜读《易经》，反复翻阅，串连竹简的皮绳竟磨断了三次。后人用"韦编三绝"形容读书勤奋刻苦。',
    en: 'From the Records of the Grand Historian. In his later years Confucius studied the Book of Changes so often that the leather thongs binding its bamboo slips snapped three times. It describes tireless devotion to study.',
  },
  洛阳纸贵: {
    zh: '出自《晋书·左思传》。左思写成《三都赋》，起初无人重视；经名家推崇后，豪门贵族竞相传抄，洛阳的纸张都因此涨价。形容著作风行一时、广为流传。',
    en: 'From the Book of Jin. Zuo Si\'s Rhapsody on the Three Capitals was ignored at first; once praised by famous men, the great houses raced to copy it and paper grew dear in Luoyang. It describes a work that takes the world by storm.',
  },
  江郎才尽: {
    zh: '出自《南史·江淹传》。江淹年少时文采出众，晚年却才思衰退。传说他梦见晋代郭璞向他索还一支五色笔，此后便再也写不出好文章。比喻才思枯竭。',
    en: 'From the History of the Southern Dynasties. Jiang Yan wrote brilliantly in youth but declined in later years. Legend says he dreamed that Guo Pu reclaimed a five-coloured brush from him, after which his writing failed. It means exhausted talent.',
  },
  东山再起: {
    zh: '出自《晋书·谢安传》。谢安早年隐居会稽东山，屡辞征召；后来出仕，在淝水之战中指挥晋军大败前秦。后指失势之后重新得势。',
    en: 'From the Book of Jin. Xie An long lived in retirement on East Mountain, declining office; he later returned to serve and commanded Jin to victory over Former Qin at Feishui. It means to stage a comeback after a setback.',
  },
  草木皆兵: {
    zh: '出自《晋书·苻坚载记》。淝水之战前，苻坚登城远望，见晋军阵容严整，又把八公山上的一草一木都看成了晋兵。形容人在惊慌时疑神疑鬼。',
    en: 'From the Book of Jin. Before the battle of Feishui, Fu Jian climbed the wall and, seeing the ordered ranks of the Jin army, mistook every tree and blade of grass on Mount Bagong for enemy soldiers. It describes panic-stricken suspicion.',
  },
  风声鹤唳: {
    zh: '出自《晋书·谢玄传》。淝水战败后，前秦溃兵一路奔逃，听到风声和鹤叫，都以为是晋军追兵赶来。常与"草木皆兵"连用，形容极度惊恐疑惧。',
    en: 'From the Book of Jin. After their defeat at Feishui, the fleeing soldiers of Former Qin took the sound of wind and the cry of cranes for pursuing Jin troops. It describes extreme fear and panic.',
  },
  破镜重圆: {
    zh: '出自唐代孟棨《本事诗》。南朝陈将亡时，徐德言与妻子乐昌公主把一面铜镜破成两半，各执其一，约定他日以镜相寻。陈亡后公主被没入杨素府中，徐德言凭半镜找到她，两人终得团聚。比喻夫妻离散后重新团圆。',
    en: 'From Meng Qi\'s Benshi Shi. As the Chen dynasty fell, Xu Deyan and Princess Lechang split a bronze mirror, each keeping half as a token. After Chen\'s fall the princess was taken into Yang Su\'s household; Xu found her by the broken mirror and they were reunited. It means a separated couple coming together again.',
  },
  举案齐眉: {
    zh: '出自《后汉书·梁鸿传》。梁鸿与妻子孟光隐居，孟光每次给丈夫送饭，都把托盘举到与眉毛齐平，以示敬重。后人用"举案齐眉"形容夫妻互相敬重、和睦相处。',
    en: 'From the History of the Later Han. The recluse Liang Hong and his wife Meng Guang lived in retirement; whenever she served him food she raised the tray to the level of her eyebrows in respect. It describes a respectful, harmonious marriage.',
  },
  毛遂自荐: {
    zh: '出自《史记·平原君列传》。秦军围邯郸，平原君赴楚求救，门客毛遂自请同往。谈判久拖不决时，毛遂按剑上前，陈说利害，终于说服楚王结盟出兵。比喻自告奋勇、主动推荐自己。',
    en: 'From the Records of the Grand Historian. When Qin besieged Handan, Lord Pingyuan went to Chu for help and his retainer Mao Sui asked to come along. As the talks stalled, Mao Sui stepped forward sword in hand and persuaded the King of Chu to ally. It means to volunteer oneself.',
  },
  背水一战: {
    zh: '出自《史记·淮阴侯列传》。韩信攻赵，故意背靠河水列阵，使将士无路可退，只得拼死作战，终于大破赵军。后指断绝退路、决一死战。',
    en: 'From the Records of the Grand Historian. Attacking Zhao, Han Xin deliberately drew up his army with a river at its back, leaving no retreat, so his men fought to the death and routed the enemy. It means to fight with no way out.',
  },
  孺子可教: {
    zh: '出自《史记·留侯世家》。张良在桥上遇见一位老人，老人故意把鞋掉到桥下叫他去捡，张良忍怒照办，又几次如约赴会，老人终于授他兵书，说"孺子可教矣"。指年轻人有出息、值得培养。',
    en: 'From the Records of the Grand Historian. On a bridge an old man deliberately dropped his shoe and made Zhang Liang fetch it; Zhang Liang bore it patiently and kept their later appointments, and the old man gave him a book of strategy, saying, "This lad can be taught." It means a promising young person.',
  },
  运筹帷幄: {
    zh: '出自《史记·高祖本纪》。刘邦评价张良说："运筹策帷帐之中，决胜于千里之外，吾不如子房。"指在后方筹划决策，却能决定千里之外战场的胜负。',
    en: 'From the Records of the Grand Historian. Liu Bang said of Zhang Liang, "In planning within a tent to decide victory a thousand li away, I am no match for Zifang." It means to devise strategy at headquarters and command distant battles.',
  },
  老马识途: {
    zh: '出自《韩非子·说林上》。管仲随齐桓公讨伐孤竹，归途中迷了路，便放老马在前引路，队伍跟着它果然找到道路。比喻有经验的人熟悉情况，能起引路作用。',
    en: 'From Han Feizi. Returning from a campaign against Guzhu, Guan Zhong lost the way; he let an old horse lead and the army followed it to the road. Experience knows the way.',
  },
  管鲍之交: {
    zh: '出自《史记·管晏列传》。管仲与鲍叔牙相交多年，鲍叔牙始终理解他的处境，并在齐桓公面前举荐他为相。管仲感叹："生我者父母，知我者鲍子也。"比喻交情深厚、彼此信任的朋友。',
    en: 'From the Records of the Grand Historian. Bao Shuya understood Guan Zhong through every hardship and recommended him as minister to Duke Huan of Qi. Guan Zhong sighed, "My parents gave me life; it is Bao who knows me." It means deep, trusting friendship.',
  },
  一诺千金: {
    zh: '出自《史记·季布栾布列传》。楚人季布为人重信义，答应的事一定做到，当时人说"得黄金百斤，不如得季布一诺"。形容说话算数、极守信用。',
    en: 'From the Records of the Grand Historian. The Chu man Ji Bu kept his word without fail; people said, "A hundred catties of gold is worth less than one promise from Ji Bu." It means utterly trustworthy.',
  },
  图穷匕见: {
    zh: '出自《战国策·燕策三》。荆轲奉命刺秦王，把匕首卷在燕国地图里进献。图卷展到尽头，匕首露了出来，荆轲持匕刺向秦王，未能成功。比喻事情发展到最后，真相或本意终于暴露。',
    en: 'From the Intrigues of the Warring States. Jing Ke hid a dagger in a rolled map of Yan to assassinate the King of Qin. When the scroll was fully unrolled the blade appeared; he struck but failed. It means the truth is revealed at the last.',
  },
  兔死狗烹: {
    zh: '出自《史记·越王勾践世家》。范蠡助越王勾践灭吴后辞官隐居，写信劝文种离开，说"蜚鸟尽，良弓藏；狡兔死，走狗烹"。比喻事情成功后，功臣往往被抛弃甚至加害。',
    en: 'From the Records of the Grand Historian. After helping King Goujian of Yue destroy Wu, Fan Li retired and warned Wen Zhong: "When the birds are gone, the good bow is put away; when the cunning hare is dead, the hound is cooked." It means discarded after service.',
  },
  假途灭虢: {
    zh: '出自《左传·僖公五年》。晋献公向虞国借道去攻打虢国，虞国大夫宫之奇以"唇亡齿寒"劝阻，虞君不听。晋灭虢后，回师途中顺手又灭了虞国。比喻以借路为名，实际侵占对方。',
    en: 'From the Zuo Commentary. Duke Xian of Jin borrowed a road through Yu to attack Guo; Yu\'s minister Gong Zhiqi warned that "without lips the teeth grow cold," but the duke of Yu ignored him. Having destroyed Guo, Jin swallowed Yu on the way home. It means using borrowed passage as a pretext for conquest.',
  },
  三令五申: {
    zh: '出自《史记·孙子吴起列传》。孙武为吴王训练宫女，再三申明号令，宫女们仍嬉笑不听；孙武便斩杀两名队长以立军威，队伍立刻整齐肃然。后指反复多次地告诫、命令。',
    en: 'From the Records of the Grand Historian. Training the king of Wu\'s palace women, Sun Wu repeated his orders again and again, but they only laughed; he then executed two of their leaders to establish discipline, and the ranks fell silent and straight. It means to give repeated orders and warnings.',
  },
  入木三分: {
    zh: '出自唐代张怀瓘《书断》。传说王羲之在木板上写字，后来刻工削木板时，发现墨迹竟渗入木头三分深。形容书法笔力遒劲，也比喻见解、议论深刻。',
    en: 'From Zhang Huaiguan\'s Shuduan. Wang Xizhi is said to have written on a wooden board; when a craftsman later planed it, the ink had soaked three-tenths of an inch into the wood. It describes forceful brushwork or penetrating insight.',
  },
  画饼充饥: {
    zh: '出自《三国志·魏书·卢毓传》。魏明帝要卢毓选拔人才，告诫他说，选人不能只看名声，因为"名如画地作饼，不可啖也"——名声像在地上画个饼，是吃不饱的。比喻用空想来安慰自己。',
    en: 'From the Records of the Three Kingdoms. Emperor Ming told Lu Yu not to choose officials by reputation alone, for "a name is like a painted cake — it cannot be eaten." It means to comfort oneself with empty hopes.',
  },
  揭竿而起: {
    zh: '出自《史记·陈涉世家》。秦末陈胜、吴广在大泽乡起义，砍下树木作兵器，举起竹竿当旗帜，天下纷纷响应。后指人民起义反抗。',
    en: 'From the Records of the Grand Historian. In the late Qin, Chen Sheng and Wu Guang rose at Daze Village, cutting wood for weapons and raising bamboo poles as banners, and the land answered. It means a popular uprising.',
  },
  约法三章: {
    zh: '出自《史记·高祖本纪》。刘邦率军入关中，与百姓约定三条法令："杀人者死，伤人及盗抵罪"，废除秦朝的苛法严刑，深受拥戴。后泛指订立简明条款共同遵守。',
    en: 'From the Records of the Grand Historian. Entering the pass of Guanzhong, Liu Bang agreed with the people on three laws — "the killer shall die; the injurer and the thief shall be punished" — and abolished Qin\'s harsh code. It means to fix simple, agreed rules.',
  },
  萧规曹随: {
    zh: '出自《史记·曹相国世家》。曹参继萧何出任汉朝丞相，一切遵循萧何制定的法规，不作更改，使百姓得以休养生息。比喻后人沿袭前人的成规办事。',
    en: 'From the Records of the Grand Historian. Succeeding Xiao He as chancellor, Cao Shen followed Xiao\'s statutes unchanged, letting the people recover. It means to carry on a predecessor\'s established rules.',
  },
  望洋兴叹: {
    zh: '出自《庄子·秋水》。秋天大水，河伯欣然自喜，以为天下之美尽在于己；顺流东行到了北海，只见汪洋无边，才仰面向若叹息，自知渺小。比喻因力量或条件不够而感到无可奈何。',
    en: 'From Zhuangzi. In autumn floods the River Lord swelled with pride, thinking all beauty was his; when he reached the North Sea and saw its boundlessness he looked up and sighed, knowing his own smallness. It means to lament helplessly before something beyond one.',
  },
  庖丁解牛: {
    zh: '出自《庄子·养生主》。庖丁为文惠君宰牛，手、肩、脚、膝的动作与刀声无不合乎节律。他说自己顺着牛体天然的纹理下刀，从不硬碰筋骨。比喻技艺纯熟，做事得心应手。',
    en: 'From Zhuangzi. Butcher Ding carved an ox for Lord Wenhui with movements and sounds all in rhythm. He followed the natural grain of the beast and never forced the joints. It means masterly skill and effortless ease.',
  },
  游刃有余: {
    zh: '出自《庄子·养生主》。庖丁说，牛骨节之间有空隙，而刀刃薄得几乎没有厚度，以薄刃入空隙，"恢恢乎其于游刃必有余地矣"。比喻技艺熟练、经验丰富，做事从容不费力。',
    en: 'From Zhuangzi. Butcher Ding explained that the joints have gaps while the blade is nearly without thickness, so the edge moves through "with ample room to spare." It means to handle a task with practised ease.',
  },
  鹏程万里: {
    zh: '出自《庄子·逍遥游》。北方大海中的大鹏鸟振翅南飞，翅膀拍击水面激起三千里波涛，乘着旋风直上九万里高空。后人用"鹏程万里"比喻前程远大。',
    en: 'From Zhuangzi. The great Peng of the northern sea beat its wings to stir waves three thousand li wide and rose on a whirlwind ninety thousand li high. It means a brilliant future.',
  },
  沉鱼落雁: {
    zh: '出自《庄子·齐物论》。毛嫱、丽姬是人认为最美的女子，可是鱼儿见了她们就沉入水底，鸟儿见了高飞，麋鹿见了跑开。后以"沉鱼落雁"形容女子容貌极美。',
    en: 'From Zhuangzi. Maoqiang and Liji were deemed the fairest of women, yet fish sank at the sight of them, birds flew high and deer fled. The phrase describes surpassing beauty.',
  },
  鹿死谁手: {
    zh: '出自《晋书·石勒载记》。石勒自比古代帝王，说若与汉高祖刘邦同时，"当并驱于中原，未知鹿死谁手"。古人以逐鹿比喻争夺天下，后指不知最后胜利归谁。',
    en: 'From the Book of Jin. Shi Le said that had he lived alongside Liu Bang, they would have "raced across the Central Plain, and it is not known whose hand would fell the deer." It means the outcome is undecided.',
  },
  项庄舞剑: {
    zh: '出自《史记·项羽本纪》鸿门宴。项庄借舞剑助兴之名，意在刺杀刘邦；项伯看出用意，也拔剑起舞，以身遮护刘邦。后以"项庄舞剑，意在沛公"比喻言行表面一套，实则别有所图。',
    en: 'From the Records of the Grand Historian. At the Hongmen banquet, Xiang Zhuang danced with his sword ostensibly for entertainment but meant to kill Liu Bang; Xiang Bo rose and danced too, shielding him. It means words or acts that conceal a hidden aim.',
  },
  霸王别姬: {
    zh: '出自《史记·项羽本纪》。项羽被汉军围困垓下，夜里听到四面传来楚人的歌声，军心涣散。他自知大势已去，与爱妾虞姬慷慨悲歌、依依诀别。后指英雄末路的悲壮离别。',
    en: 'From the Records of the Grand Historian. Besieged at Gaixia, Xiang Yu heard Chu songs on every side and knew his cause was lost. He sang a mournful farewell to his beloved Consort Yu. It means a tragic parting at the end of a hero\'s road.',
  },
  东窗事发: {
    zh: '出自明代田汝成《西湖游览志馀》。传说秦桧曾与妻子王氏在东窗下密谋陷害岳飞。秦桧死后，王氏请方士去阴间探看，秦桧托话回来说"东窗事发矣"。后指阴谋败露。',
    en: 'From Tian Rucheng\'s Xihu Youlan Zhiyu. Qin Hui is said to have plotted the ruin of Yue Fei with his wife beneath the eastern window. After his death a medium visited him in the underworld and brought back his words: "The affair of the eastern window is exposed." It means a plot is uncovered.',
  },
  铁面无私: {
    zh: '源自宋代名臣包拯。包拯为官刚正，执法严峻，不畏权贵，不徇私情，民间称其"铁面"。后以"铁面无私"形容为人公正严明、不讲情面。',
    en: 'From the Song official Bao Zheng, who judged with stern impartiality, fearing no powerful family and sparing no friend; the people called him "iron-faced." It means strictly just and impartial.',
  },
  大器晚成: {
    zh: '出自《老子》四十一章："大方无隅，大器晚成。"意思是贵重的器物需要长时间才能制成，比喻能担当大事的人往往成就较晚。',
    en: 'From the Daodejing: "The greatest square has no corners; the greatest vessel is the last to be completed." It means that those destined for great things often succeed late.',
  },
  卷土重来: {
    zh: '出自唐代杜牧《题乌江亭》："胜败兵家事不期，包羞忍耻是男儿。江东子弟多才俊，卷土重来未可知。"指失败之后重新组织力量再来。',
    en: 'From Du Mu\'s poem at the Wujiang Pavilion: "Victory and defeat are not to be foretold; the true man swallows shame and bides his time. The young men of Jiangdong are many and able — a return with rallied strength is not impossible." It means to come back after a defeat.',
  },
  老骥伏枥: {
    zh: '出自三国曹操《步出夏门行·龟虽寿》："老骥伏枥，志在千里；烈士暮年，壮心不已。"意思是年老的千里马虽伏在马槽旁，仍想着奔驰千里；有志之士到了晚年，雄心也不停止。',
    en: 'From Cao Cao\'s poem: "The old steed in its stall still dreams of a thousand li; the man of spirit, in his late years, does not give up his great ambition." It means an unquenched ambition in old age.',
  },
  门庭若市: {
    zh: '出自《战国策·齐策一》。邹忌讽齐王纳谏后，齐威王下令广开言路、奖励进谏，一时间群臣吏民纷纷前来提意见，宫门前像集市一样热闹。形容来客很多、非常热闹。',
    en: 'From the Intrigues of the Warring States. After Zou Ji persuaded King Wei of Qi to invite criticism, officials and commoners flocked to advise him, and his gate was like a marketplace. It describes a place thronged with visitors.',
  },
  南柯一梦: {
    zh: '出自唐代李公佐《南柯太守传》。淳于棼醉后入睡，梦见自己被迎入大槐安国，娶了公主，做了二十年南柯太守，享尽荣华；醒来才知所谓王国只是槐树下的一个蚁穴。比喻一场空梦或世事无常。',
    en: 'From Li Gongzuo\'s Tale of the Governor of Nanke. Drunk, Chunyu Fen dreamed he was welcomed into the Great Huaian Kingdom, married a princess and ruled Nanke for twenty years in splendour; waking, he found the kingdom was only an ant nest under a locust tree. It means an empty dream or the vanity of worldly things.',
  },
  怒发冲冠: {
    zh: '出自《史记·廉颇蔺相如列传》。蔺相如持和氏璧见秦王，见秦王无意兑现割城之诺，便举璧睨柱，愤怒得头发直竖，顶起了帽子。形容极度愤怒。',
    en: 'From the Records of the Grand Historian. Holding the jade disc before the King of Qin, Lin Xiangru saw he would not cede the promised cities; glaring at a pillar, he grew so angry his hair lifted his cap. It describes furious anger.',
  },
  披荆斩棘: {
    zh: '出自《后汉书·冯异传》。光武帝刘秀称赞冯异"为吾披荆棘，定关中"。意思是劈开丛生的荆棘，形容在创业途中扫除障碍、艰苦奋斗。',
    en: 'From the History of the Later Han. Emperor Guangwu praised Feng Yi for "cutting through thorns for me and pacifying Guanzhong." It means to clear obstacles and endure hardship in building something.',
  },
  如鱼得水: {
    zh: '出自《三国志·蜀书·诸葛亮传》。刘备得到诸葛亮辅佐后，对关羽、张飞说："孤之有孔明，犹鱼之有水也。"比喻得到与自己十分投合的人，或处身于十分合适的环境。',
    en: 'From the Records of the Three Kingdoms. Having gained Zhuge Liang\'s help, Liu Bei told his generals, "That I have Kongming is like a fish having water." It means to find the right person or environment.',
  },
  三缄其口: {
    zh: '出自《孔子家语·观周》。孔子在周朝太庙见到一尊铜人，背后铭文告诫"古之慎言人也……无多言，多言多败"，铜人的口部还被三重封缄。形容说话极其谨慎，或闭口不言。',
    en: 'From the Family Sayings of Confucius. In the Zhou ancestral temple Confucius saw a bronze statue whose back bore a warning to "be sparing of speech, for much talk brings much failure," its mouth sealed three times over. It means to keep strictly silent.',
  },
  水到渠成: {
    zh: '出自宋代苏轼《答秦太虚书》。苏轼论作文说，应当"如水之在地，随物赋形"，自然流淌，到得去处便成沟渠。比喻条件成熟，事情自然成功，不必强求。',
    en: 'From Su Shi\'s letter to Qin Guan. Writing, he said, should be "like water on the ground, taking the shape of whatever it meets"; it flows on and forms a channel of itself. It means success follows naturally once conditions are ripe.',
  },
  五十步笑百步: {
    zh: '出自《孟子·梁惠王上》。孟子说，战场上逃跑的士兵中，逃了五十步的人去嘲笑逃了一百步的人，其实同样是逃跑。比喻自己跟别人有同样的缺点错误，只是程度轻些，却去讥笑别人。',
    en: 'From Mencius. On the battlefield, a soldier who fled fifty paces mocked one who fled a hundred — yet both had run. It means to mock others for a fault one shares, only in lesser degree.',
  },
  以卵击石: {
    zh: '出自《墨子·贵义》。墨子说，以卵投石，把天下的鸡蛋都投光，石头也不会损坏。比喻不自量力，自取灭亡。',
    en: 'From Mozi. To throw eggs at a stone, he said, would exhaust every egg in the world without harming the stone. It means to court destruction by overrating oneself.',
  },
  捉襟见肘: {
    zh: '出自《庄子·让王》。曾子居卫，十年不添新衣，正一正衣襟，胳膊肘就露了出来。形容衣服破烂，也比喻顾此失彼、处境窘迫，应付不过来。',
    en: 'From Zhuangzi. Zengzi lived in Wei for ten years without a new coat; tugging his lapel straight bared his elbow. It describes ragged poverty, or being hard-pressed and unable to cope.',
  },
  自惭形秽: {
    zh: '出自《世说新语·容止》。卫玠的舅舅王济本是仪表堂堂的美男子，见了外甥却感叹"珠玉在侧，觉我形秽"——有美玉在身旁，就觉得自己丑陋。指因不如别人而感到惭愧。',
    en: 'From A New Account of Tales of the World. Wang Ji, a handsome man, sighed before his nephew Wei Jie, "With pearls and jade beside me, I feel my own coarseness." It means to feel ashamed of being outshone.',
  },
  坐井观天: {
    zh: '出自唐代韩愈《原道》："坐井而观天，曰天小者，非天小也。"意思是坐在井里看天，说天小，其实并不是天小。比喻眼界狭小、见识有限。',
    en: 'From Han Yu\'s Yuan Dao: "To sit in a well and look at the sky and say the sky is small — the sky is not small." It means narrow outlook and limited experience.',
  },
};