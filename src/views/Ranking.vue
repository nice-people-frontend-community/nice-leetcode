<template>
  <div class="page">
    <el-container>
      <el-header>
        <h2>总榜</h2>
      </el-header>

      <el-main v-if="users.length">
        <el-row :gutter="20" v-for="(user, index) in users" :key="user.userId" class="row">
          <el-col :span="1">
            {{ index + 1 }}
          </el-col>

          <el-col :span="2" :title="user.userName" class="text-ellipsis">
            {{ user.userName }}
          </el-col>

          <el-col :span="2">
            {{ user.levelText }}
          </el-col>

          <el-col :span="2">
            {{ user.weeks.length ? `已坚持 ${user.weeks.length} 周` : '' }}
          </el-col>

          <el-col :span="17">
            <template v-if="!user.weeks.length" />
            <template v-else>
              <div class="text-ellipsis">
                <span
                  v-for="week in (user.weeks || []).sort((a, b) => b - a)"
                  class="weeks"
                  :style="{ backgroundColor: backgroundColor(week) }"
                  :key="week"
                >
                  第{{ week }}周
                </span>
              </div>
            </template>
          </el-col>
        </el-row>
      </el-main>

      <el-empty class="emptyBox" description="暂无匹配的数据" v-if="!users.length" />
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { formatAwardLevel } from '@/utils';
import type { IUser } from '@@/scripts/typings';

interface IUserRanking extends IUser {
  weeks: number[];
  level: number;
  levelText: string;
}

const users = ref<IUserRanking[]>([]);

const getUsers = async () => {
  const res = await axios.get<IUserRanking[]>(`/data/common/award-ranking.json?v=${+new Date()}`);

  users.value = res.data
    .sort((a, b) => b.weeks.length - a.weeks.length)
    .map((el) => ({
      ...el,
      level: el.weeks.length,
      levelText: formatAwardLevel(el.weeks.length),
    }));
};

enum ColorMap {
  '#c2cdf0', // 0
  '#fbd3d0', // 1
  '#e4f7d2', // ...
  '#f7e9bc',
  '#c4e4f5',
  '#e8e8e8',
  '#e8d5cb',
  '#c0ebe5',
  '#dbcef5',
  '#e5edca',
}
function backgroundColor(week: number) {
  return ColorMap[week % 10];
}

/**初始化用户列表 */
getUsers();
</script>

<style scoped lang="scss">
.page {
  margin: 0 20px;
  cursor: pointer;

  .row {
    border: 1px solid #fff;
    line-height: 1.8;

    &:hover {
      border-color: black;
      background-color: #f1f1f1;
    }

    .weeks {
      display: inline-block;
      box-sizing: border-box;
      width: 56px;
      margin: 0 4px;
      font-size: 8px;
      text-align: center;
    }

    .text-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

v-deep .el-row {
  margin-bottom: 20px;
}
</style>
