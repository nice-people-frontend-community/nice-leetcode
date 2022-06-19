"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.getISOWeekNumber = exports.getWeekStartAndEnd = exports.getAcSubmissions = exports.lcQuery = exports.isFileExists = exports.DATE_FORMAT_STRING = void 0;
var axios_1 = require("axios");
var fs = require("fs");
var path = require("path");
var dayjs = require('dayjs');
var isoWeekPlugin = require('dayjs/plugin/isoWeek');
var lcusAllQuestionsMap = require('../dict/lcus_all_questions_map.json');
dayjs.extend(isoWeekPlugin);
// 日期格式化方式
exports.DATE_FORMAT_STRING = 'YYYY-MM-DD';
/**
 * 判断文件是否存在
 * @param {string} path 文件路径
 * @returns {Promise<boolean>} 是否存在
 */
var isFileExists = function (path) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                fs.stat(path, function (err) {
                    if (err) {
                        resolve(false);
                    }
                    else {
                        resolve(true);
                    }
                });
            })];
    });
}); };
exports.isFileExists = isFileExists;
/**
 * Axios请求
 * @param user 用户信息
 * @returns
 */
var lcQuery = function (user) { return __awaiter(void 0, void 0, void 0, function () {
    var url, graphqlQuery, options, response, _a, recentACSubmissions, recentAcSubmissionList, result_1, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                url = user.lcus
                    ? 'https://leetcode.com/graphql/'
                    : 'https://leetcode.cn/graphql/noj-go/';
                graphqlQuery = user.lcus
                    ? {
                        query: '\n    query recentAcSubmissions($username: String!, $limit: Int!) {\n  recentAcSubmissionList(username: $username, limit: $limit) {\n    id\n    title\n    titleSlug\n    timestamp\n  }\n}\n    ',
                        variables: { username: user.userId, limit: 50 }
                    }
                    : {
                        query: '\n    query recentACSubmissions($userSlug: String!) {\n  recentACSubmissions(userSlug: $userSlug) {\n    submissionId\n    submitTime\n    question {\n      translatedTitle\n      titleSlug\n      questionFrontendId\n    }\n  }\n}\n    ',
                        variables: { userSlug: user.userId }
                    };
                options = {
                    //Method is post because we are requesting from graphql
                    method: 'POST',
                    url: url,
                    headers: {},
                    data: graphqlQuery
                };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1["default"].request(options)];
            case 2:
                response = _b.sent();
                _a = response.data.data, recentACSubmissions = _a.recentACSubmissions, recentAcSubmissionList = _a.recentAcSubmissionList;
                result_1 = [];
                if (user.lcus) {
                    // 美服
                    recentAcSubmissionList.forEach(function (el) {
                        var _a;
                        result_1.push({
                            // 从映射中获取美服问题的ID
                            questionFrontendId: ((_a = lcusAllQuestionsMap[el.titleSlug]) === null || _a === void 0 ? void 0 : _a.questionId) || el.titleSlug,
                            titleSlug: el.titleSlug,
                            submitTime: +el.timestamp * 1000
                        });
                    });
                }
                else {
                    // 国服
                    recentACSubmissions.forEach(function (el) {
                        result_1.push({
                            questionFrontendId: el.question.questionFrontendId,
                            titleSlug: el.question.titleSlug,
                            submitTime: el.submitTime * 1000
                        });
                    });
                }
                return [2 /*return*/, result_1];
            case 3:
                err_1 = _b.sent();
                throw err_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.lcQuery = lcQuery;
/**
 * 获取用户某一天的的提交记录
 * @param userInfo 用户信息
 * @param date 统计哪一天的提交
 * @param callback mapLimit 并发队列的回调函数
 * @description 利用最近 15 道 AC 的题目的接口，过滤后获得结果，最好是统计最近1~2天
 */
var getAcSubmissions = function (userInfo, date, callback) { return __awaiter(void 0, void 0, void 0, function () {
    var userName, userId, _a, lcus, filePath, exists, recentACSubmissions, todayACQuestionIds, uniqeQuestionIds, archivesData, weekDateList_1, currentWeekQuestionIds_1, targetLog, questionIds_1, reviewIds_1, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userName = userInfo.userName, userId = userInfo.userId, _a = userInfo.lcus, lcus = _a === void 0 ? false : _a;
                filePath = path.resolve(__dirname, "../archives/".concat(userName, "(").concat(userId, ").json"));
                return [4 /*yield*/, (0, exports.isFileExists)(filePath)];
            case 1:
                exists = _b.sent();
                if (!exists) {
                    // 创建文件
                    fs.writeFileSync(filePath, JSON.stringify({
                        userName: userName,
                        userId: userId,
                        homepage: lcus
                            ? "https://leetcode.com/u/".concat(userId, "/")
                            : "https://leetcode.cn/u/".concat(userId, "/"),
                        logs: []
                    }), {
                        encoding: 'utf8'
                    });
                }
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, 5, 6]);
                return [4 /*yield*/, (0, exports.lcQuery)(userInfo)];
            case 3:
                recentACSubmissions = _b.sent();
                todayACQuestionIds = recentACSubmissions
                    .filter(function (row) { return dayjs(row.submitTime).format(exports.DATE_FORMAT_STRING) === date; })
                    .map(function (row) { return "[".concat(row.questionFrontendId, "]"); });
                uniqeQuestionIds = Array.from(new Set(todayACQuestionIds));
                archivesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                // 记录更新时间
                archivesData.updatedAt = dayjs().format();
                weekDateList_1 = (0, exports.getWeekStartAndEnd)(date);
                currentWeekQuestionIds_1 = [];
                archivesData.logs
                    .filter(function (log) {
                    return +new Date(log.date) >= +new Date(weekDateList_1[0]) &&
                        +new Date(log.date) < +new Date(date);
                })
                    .forEach(function (el) {
                    currentWeekQuestionIds_1.push.apply(currentWeekQuestionIds_1, el.questionIds);
                    currentWeekQuestionIds_1.push.apply(currentWeekQuestionIds_1, el.reviewQuestionIds);
                });
                targetLog = archivesData.logs.find(function (log) { return log.date === date; });
                questionIds_1 = [];
                reviewIds_1 = [];
                uniqeQuestionIds.forEach(function (questionId) {
                    // 判断是否是历史出现过的题目
                    if (currentWeekQuestionIds_1.includes(questionId)) {
                        reviewIds_1.push(questionId);
                    }
                    else if (!reviewIds_1.includes(questionId)) {
                        // 避免已经出现在当天的复习题中的这种情况
                        questionIds_1.push(questionId);
                    }
                });
                if (!targetLog) {
                    archivesData.logs.push({
                        date: date,
                        questionIds: questionIds_1,
                        reviewQuestionIds: reviewIds_1
                    });
                }
                else {
                    // 保存时去重一次
                    targetLog.questionIds = Array.from(new Set(__spreadArray(__spreadArray([], targetLog.questionIds, true), questionIds_1, true)));
                    targetLog.reviewQuestionIds = Array.from(new Set(__spreadArray(__spreadArray([], (targetLog.reviewQuestionIds || []), true), reviewIds_1, true)));
                }
                // 针对日期排序，最近的日期在上面
                archivesData.logs.sort(function (a, b) { return +new Date(b.date) - +new Date(a.date); });
                fs.writeFileSync(filePath, JSON.stringify(archivesData), {
                    encoding: 'utf8'
                });
                return [3 /*break*/, 6];
            case 4:
                err_2 = _b.sent();
                console.error("\u7528\u6237 [".concat(userId, "] \u7EDF\u8BA1\u5931\u8D25\u3002\u53EF\u4EE5\u624B\u52A8\u524D\u5F80\u7528\u6237\u4E3B\u9875\u67E5\u770B https://leetcode.cn/u/").concat(userId, "/"));
                return [3 /*break*/, 6];
            case 5:
                console.log("\u7528\u6237 [".concat(userId, "] --- ok"));
                callback && callback(null);
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.getAcSubmissions = getAcSubmissions;
/**
 * 获取某个日期所在ISO周的起止日期
 * @param {string} date YYYY-MM-DD
 * @returns 日期列表 [YYYY-MM-DD]
 */
var getWeekStartAndEnd = function (date) {
    // 当前周的星期一
    var startDate = dayjs(date).startOf('isoWeek').format(exports.DATE_FORMAT_STRING);
    var dateList = [];
    var index = 0;
    while (index < 7) {
        dateList.push(dayjs(startDate).add(index, 'day').format(exports.DATE_FORMAT_STRING));
        index += 1;
    }
    return dateList;
};
exports.getWeekStartAndEnd = getWeekStartAndEnd;
/**
 * 获取某个日期所在的ISO周数
 * @param date 日期 YYYY-MM-DD
 * @returns
 */
var getISOWeekNumber = function (date) { return dayjs(date).isoWeek(); };
exports.getISOWeekNumber = getISOWeekNumber;
