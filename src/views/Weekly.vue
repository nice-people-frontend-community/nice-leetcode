<template>
  <div class="weekly-container">
    <a class="fixed-widget" :href="context + '/docs'" target="_blank"> 日报 </a>
    <el-alert
      class="weekly-alert"
      title="不要忘记在群里截图打卡哦~"
      description="本周内做题超过 14 题并且没有在微信群截图打卡的同学将会获得『偷学大师』的称号；连续两周获取此称号的同学将不再参与排名统计!"
      type="error"
      :closable="false"
      style="position: sticky; z-index: 999; top: 0; margin-bottom: 10px"
    >
    </el-alert>
    <div class="markdown-body" v-html="weekFileContent" ref="mdBody"></div>
  </div>
</template>

<script lang="ts" setup>
import clipboardJs from 'clipboard';
import dayjs from 'dayjs';
import domToImage from 'dom-to-image';
import { getISOWeekNumber, getToday, getWeekStartAndEnd } from '@/utils';
import { markdownRender } from '@/utils/markdown';
import http from '@/utils/http';

// 获取当前日期
const queryDate = getToday();
// 当前日所在的ISO周数
const dateList = getWeekStartAndEnd(queryDate);

// 判断本周属于哪个年度，以当前周四所在的年份为准
// 周汇总的文件名称
const weekRollupFileName = `${new Date(dateList[3]).getFullYear()}年第${getISOWeekNumber(queryDate)}周(${dateList[0]}_${
  dateList[dateList.length - 1]
})`;

const weekFileContent = ref('');
const queryWeekRollup = () => {
  weekFileContent.value = '查询中...';
  http.get(`/weeks/${weekRollupFileName}.md?v=${+new Date()}`).then(({ data }) => {
    weekFileContent.value = markdownRender(data);
    nextTick(() => {
      // 控制台打印前5
      if (dayjs().day() === 0 && dayjs().hour() === 22 ? dayjs().minute() >= 50 : dayjs().hour() > 22) {
        // TODO: 需要保证数据一致性
        buildSendMessage();
      }

      // 追加操作按钮
      document.querySelector('.markdown-body h1')?.insertAdjacentHTML(
        'beforeend',
        `<div id="customAction" style="display: inline-block;margin-left: 10px">
                    <button id="copyTableBtn">复制表格</button>
                    <button id="downloadTableBtn">另存成图片</button>
                  <div>`,
      );
      // ===== 复制表格 =====
      const table = document.querySelector('.markdown-body table');
      if (table) {
        const clipboard = new clipboardJs('#copyTableBtn', {
          target: () => table,
        });
        clipboard.on('success', function (e) {
          e.clearSelection();
          ElMessage.success('复制成功');
        });
        clipboard.on('error', function () {
          ElMessage.success('复制失败');
        });
      }

      // ===== dom 生成图片 =====
      const node: Node | null = document.querySelector('.markdown-body');
      document.querySelector('.markdown-body #downloadTableBtn')?.addEventListener('click', () => {
        node &&
          domToImage
            .toPng(node, {
              style: {
                background: '#fff',
              },
            })
            .then((dataUrl: string) => {
              const link = document.createElement('a');
              link.download = `${weekRollupFileName}.png`;
              link.href = dataUrl;
              link.click();
            });
      });
    });
  });
};
queryWeekRollup();

function buildSendMessage() {
  const trDomList = document.querySelector('.markdown-body table tbody')?.querySelectorAll('tr');
  const persons = [];
  // Top5 的总人数
  let top5UserTotal = 0;
  interface top {
    users: (string | null | undefined)[];
    questionCount: number;
  }
  const top5: top[] = new Array(5).fill(0).map(() => ({
    users: [],
    questionCount: 0,
  }));
  if (!trDomList?.length) return;
  for (let i = 0; i < trDomList.length; i++) {
    const $tr = trDomList[i];
    if (!$tr) return;
    const userName = $tr.querySelector('td:nth-child(1)')?.innerHTML;
    const day1 = $tr.querySelector('td:nth-child(3)')?.innerHTML;
    const day2 = $tr.querySelector('td:nth-child(4)')?.innerHTML;
    const day3 = $tr.querySelector('td:nth-child(5)')?.innerHTML;
    const day4 = $tr.querySelector('td:nth-child(6)')?.innerHTML;
    const day5 = $tr.querySelector('td:nth-child(7)')?.innerHTML;
    const day6 = $tr.querySelector('td:nth-child(8)')?.innerHTML;
    const day7 = $tr.querySelector('td:nth-child(9)')?.innerHTML;
    const questionCount = +($tr.querySelector('td:nth-last-child(2)')?.innerHTML || '');
    const ranking = +($tr.querySelector('td:nth-last-child(1)')?.innerHTML || '');

    const fullAttendance = !!day1 && !!day2 && !!day3 && !!day4 && !!day5 && !!day6 && !!day7;
    if (questionCount >= 14 || fullAttendance) {
      persons.push({
        userName,
        questionCount,
        ranking,
      });
    }

    // 记录top5人员
    if (ranking <= 5) {
      top5UserTotal += 1;
      top5[ranking - 1] = {
        users: [...top5[ranking - 1].users, userName],
        questionCount,
      };
    }
  }
  let atMessage = `中国好青年「刷题榜」${getToday(' MM 月 DD 日')}`;
  atMessage += '\n\n';
  atMessage += persons.map((el) => `@${el.userName} `).join('');
  atMessage += '\n\n';
  atMessage += `本周全勤或刷题大于等于 14 题的共有上述 ${persons.length} 位同学，恭喜以上同学获取小星星奖励，大家越来越努力了呀！[庆祝][庆祝][庆祝]`;

  atMessage += '\n\n';
  atMessage += `其中，本周 Top5 的一共有 ${top5UserTotal} 位同学，他们分别是：\n`;
  const rankingString = ['一', '二', '三', '四', '五'];
  for (let i = 0; i < top5.length; i++) {
    const row = top5[i];
    const ranking = rankingString[i];
    if (row.users.length > 1) {
      atMessage += `第${ranking}名的有 ${row.users.length} 位同学，分别是 ${row.users
        .map((user) => `@${user}`)
        .join('、')}，以 ${row.questionCount} 道题并列第${ranking}名`;
    } else {
      atMessage += `第${ranking}名的是 @${row.users[0]} 同学，刷题 ${row.questionCount} 道`;
    }
    atMessage += i === top5.length - 1 ? '。' : ';\n';
  }

  atMessage += '\n\n努力的人总会被眷顾，祝我们都有美好的未来。[愉快]';
  console.log(atMessage);
}
</script>

<style lang="scss" scoped>
@import url('https://lib.baomitu.com/github-markdown-css/4.0.0/github-markdown.min.css');

.weekly-container {
  width: 90%;
  margin: 20px auto;
  text-align: left;

  .fixed-widget {
    display: flex;
    position: fixed;
    right: 20px;
    bottom: 50px;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    transition: color 0.3s;
    border: 1px solid #00bcd4;
    border-radius: 50%;
    background-color: #00bcd4;
    box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014, 0 9px 28px 8px #0000000d;
    color: #fff;
    text-align: center;
    text-decoration: none;
  }

  thead th {
    width: 200px;

    &:nth-last-child(1),
    &:nth-last-child(2) {
      width: 80px;
    }
  }

  .markdown-body table {
    display: table;
  }
}
</style>
