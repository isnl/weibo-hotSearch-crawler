/*
 * @Author: Peanut
 * @Description:  nodejs定时爬取微博实时热搜
 * @Date: 2020-05-01 21:51:33
 * @Last Modified by: Peanut.ZhangHuan
 * @Last Modified time: 2023-01-28 10:23:02
 * 程序员导航站：https://iiter.cn
 */
const cheerio = require("cheerio");
const superagent = require("superagent");
const fs = require("fs");
const nodeSchedule = require("node-schedule");
const weiboURL = "https://s.weibo.com";
const hotSearchURL = weiboURL + "/top/summary?cate=realtimehot";
const hotSearchCookies = `_s_tentry=passport.weibo.com; Apache=4950475133032.61.1638282900861; SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9WWoggCvDOxY-vXVGiYzJfVc; ULV=1638283021540:1:1:1:4950475133032.61.1638282900861:; SINAGLOBAL=4950475133032.61.1638282900861; SUB=_2AkMW-rguf8NxqwJRmfoWy2_lb4V0yQvEieKgpkn1JRMxHRl-yj9jqkEstRB6PXqWwYYhR1PFXzQX0RwK4Xny_dUzd9p3`;
/**
 * 获取热搜列表数据方法
 */
function getHotSearchList() {
  return new Promise((resolve, reject) => {
    superagent.get(hotSearchURL).set("cookie", hotSearchCookies).end((err, res) => {
      if (err) reject("request error");
      const $ = cheerio.load(res.text);
      let hotList = [];
      $("#pl_top_realtimehot table tbody tr").each(function (index) {
        if (index !== 0) {
          const $td = $(this).children().eq(1);
          const link = weiboURL + $td.find("a").attr("href");
          const text = $td.find("a").text();
          const hotValue = $td.find("span").text();
          const icon = $td.find("img").attr("src")
            ? "https:" + $td.find("img").attr("src")
            : "";
          hotList.push({
            index,
            link,
            text,
            hotValue,
            icon,
          });
        }
      });
      hotList.length ? resolve(hotList) : reject("errer");
    });
  });
}

/*
 * schedule

*    *    *    *    *    *    
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)

 */
/**
 * 每分钟第30秒定时执行爬取任务
 */
nodeSchedule.scheduleJob("30 * * * * *", async function () {
  try {
    const hotList = await getHotSearchList();
    await fs.writeFileSync(
      `${__dirname}/hotSearch.json`,
      JSON.stringify(hotList),
      "utf-8"
    );
    console.log("写入成功", Date.now());
  } catch (error) {
    console.error(error);
  }
});
