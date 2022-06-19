"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.weekRollup = void 0;
// 汇总每周的周报
var fs = require("fs");
var path = require("path");
var dayjs = require('dayjs');
var utils_1 = require("./utils");
var users = require('../dict/user.json');
// 当天日期
var now = dayjs();
var today = now.format(utils_1.DATE_FORMAT_STRING);
var yesterday = now.subtract(1, 'day').format(utils_1.DATE_FORMAT_STRING);
// 由于 GitHub Actions 定时器启动不准，这里做下兼容处理
// 定时器不会延迟太久，所以这里仅判断跨天的的即可
// 如果启动时间在周一凌晨 1 点以内的话，就汇总上周的记录
var queryDate = today;
if (new Date(now).getDay() === 1 && new Date(now).getHours() < 1) {
    queryDate = yesterday;
}
// 当前日所在的ISO周数
var curISOWeekNumber = (0, utils_1.getISOWeekNumber)(queryDate);
var dateList = (0, utils_1.getWeekStartAndEnd)(queryDate);
// 判断本周属于哪个年度，以当前周四所在的年份为准
var weekOfYear = new Date(dateList[3]).getFullYear();
// 周汇总的文件名称
var weekRollupFileName = "".concat(weekOfYear, "\u5E74\u7B2C").concat(curISOWeekNumber, "\u5468(").concat(dateList[0], "_").concat(dateList[dateList.length - 1], ")");
/**
 * 汇总周报
 */
var weekRollup = function () {
    var _a;
    // 生成用户排名信息
    var summaryList = [];
    for (var i = 0; i < users.length; i++) {
        var _b = users[i], userName = _b.userName, userId = _b.userId, _c = _b.hideInWeek, hideInWeek = _c === void 0 ? false : _c;
        // 跳过周报屏蔽的同学
        if (hideInWeek) {
            continue;
        }
        var archiveFilePath = path.resolve(__dirname, "../archives/".concat(userName, "(").concat(userId, ").json"));
        var userArchivesData = fs.existsSync(archiveFilePath)
            ? JSON.parse(fs.readFileSync(archiveFilePath, 'utf8'))
            : {
                // 大概率不会有找不到用户文件的情况
                // 这里只是简单的保护一下
                userId: userId,
                userName: userName
            };
        // 读取本周的数据
        var curWeekLogs = ((_a = userArchivesData.logs) !== null && _a !== void 0 ? _a : []).filter(function (el) {
            return dateList.includes(el.date);
        });
        // 只统计新题目的数量
        summaryList.push(__assign(__assign({}, userArchivesData), { curWeekLogs: curWeekLogs, newQuestionsTotal: curWeekLogs.reduce(function (sum, item) { return (sum += item.questionIds.length); }, 0) }));
    }
    // 倒序排列
    summaryList.sort(function (a, b) { return b.newQuestionsTotal - a.newQuestionsTotal; });
    // 根据题目数量进行排名，相同题目数量的，排名相同
    var rankNumber = 1;
    for (var index = 0; index < summaryList.length; index++) {
        var summary = summaryList[index];
        if (index > 0 &&
            summary.newQuestionsTotal !== summaryList[index - 1].newQuestionsTotal) {
            rankNumber += 1;
        }
        summary.ranking = rankNumber;
    }
    var weekFilePath = path.resolve(__dirname, "../weeks/".concat(weekRollupFileName, ".md"));
    // 创建文件
    fs.writeFileSync(weekFilePath, "\n# ".concat(weekRollupFileName, " \u5468\u62A5\n\n> \u66F4\u65B0\u4E8E: ").concat(dayjs().format(), "\n\n| \u7528\u6237\u540D | \u529B\u6263 |  ").concat(dateList.join('|'), "  | \u603B\u8BA1 | \u6392\u540D |\n| ---- | ---- |   ").concat(new Array(dateList.length)
        .fill(' ---- ')
        .join('|'), "  | ---- | ---- |\n").concat(summaryList
        .map(function (user) {
        return __spreadArray(__spreadArray([
            '',
            user.userName,
            // 主页
            "[".concat(user.userId, "](").concat(user.homepage, ")")
        ], dateList.map(function (date) {
            var dateLog = user.curWeekLogs.find(function (row) { return date === row.date; });
            if (!dateLog) {
                return '';
            }
            return dateLog.questionIds
                .join('')
                .replace(/\[/g, '\\[')
                .replace(/\]/g, ']');
        }), true), [
            // 总计
            user.newQuestionsTotal,
            user.ranking,
            '',
        ], false).join('|');
    })
        .join('\n'), "\n    "), {
        encoding: 'utf8'
    });
};
exports.weekRollup = weekRollup;
(0, exports.weekRollup)();
