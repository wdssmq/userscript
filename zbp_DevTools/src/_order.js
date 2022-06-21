import { _log, $ } from './_base';

(() => {
  if ($ === null) return;
  // 移除指定的节点
  function fnHide(t = "") {
    let curHtml;
    $("tr").each(function () {
      curHtml = $(this).html();
      if (/待付款/.test(curHtml)) $(this).remove();
      if (t === "all") $(this).remove();
    });
  }

  // 时间对比转天数
  function fnTimeDiff(recent, past) {
    let timeDiff = recent.getTime() - past.getTime();
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
  }

  // 初始全局变量
  const gobBase = {
    oDate: null,
    timeRan: {
      recent: null,
      past: null
    },
    // 订单计数
    intCount: 0,
    // 价格总计
    intTOL: 0,
    // 金额累加，输入为金额字符串，扣除分成
    add(amt) {
      this.intTOL += parseFloat(amt) * 100 * 0.75;
    },
    diff() {
      const intDiff = fnTimeDiff(this.timeRan.recent, this.timeRan.past);
      return intDiff > 0 ? intDiff : 1;
    },
    view(t = "") {
      let rltNum = 0;
      switch (t) {
        case "perDay":
          rltNum = this.intTOL / this.diff() / 100;
          break;
        case "perMonth":
          rltNum = this.intTOL / this.diff() / 100 * 30;
          break;
        default:
          rltNum = this.intTOL / 100;
          break;
      }
      return rltNum.toFixed(2);
    }
  }

  // 实际调用
  let gob;

  // 搜索调用
  function fnSearch(q) {
    gob = Object.assign({}, gobBase);
    _log(JSON.stringify(gob));
    const regPat = new RegExp(q + ".+已付款", "");
    fnHide("all");
    fnAjax(1, regPat);
  }

  // Ajax 请求
  function fnAjax(page, regPat) {
    $.ajax({
      url:
        "https://app.zblogcn.com/zb_users/plugin/AppBuy/shop/main.php?page=" +
        page,
      type: "get",
      success: function (data) {
        if (/已付款/.test(data)) {
          // if (/已付款/.test(data) && page < 2) {
          // _log($(data));
          let curHtml;
          $(data)
            .find("#divMain2 table tr")
            .each(function () {
              curHtml = $(this)
                .html()
                .replace(/[\n\s]+/g, " ");
              if (regPat.test(curHtml) === true) {
                // 匹配时间字符串
                let mltDate = curHtml.match(/<td.*>([^<]+)<\/td> <td>已付款<\/td>/);
                // 转换时间对象
                gob.oDate = new Date(Date.parse(mltDate[1]));

                _log(curHtml);
                _log(gob.oDate);

                // 日期区间
                if (gob.timeRan.recent === null) {
                  gob.timeRan.recent = gob.oDate;
                }
                gob.timeRan.past = gob.oDate;
                // 订单计数
                gob.intCount++;
                // 匹配金额字符串
                // let mltAMT = curHtml.match(/<td>￥([^<]+)<\/td>/);
                let mltAMT = curHtml.match(/<td>￥[^<]+\(([^<]+)\)<\/td>/);
                // 金额累加
                gob.add(mltAMT[1]);
                // 添加节点
                $("table:not(#tbStatistic) tbody").append(
                  "<tr>" + curHtml + "</tr>\n"
                );
              }
            });
          page++;
          fnAjax(page, regPat);
          $("#js-page").text(page);
        } else {
          $("#js-page").text("完成");
          const strTR = `<tr>
            <td colspan="2"></td>
            <td>${gob.intCount}</td>
            <td>${gob.view()}</td>
            <td colspan="2">${gob.view("perDay")}/天 | ${gob.view("perMonth")}/30 天</td>
            <td>天数：${gob.diff()}</td>
            <td></td>
            <td></td>
          </tr>`;
          $("table:not(#tbStatistic) tbody").prepend(
            strTR
          );
          // _log(gob);
        };
      },
      // end success
    });
  }

  // 放置搜索框
  $(".SubMenu").append(
    '<input id="search" style="float:left;margin-right: 2px;margin-top: 2px" type="text" value="">' +
    '<a href="javascript:;" id="js-search"><span class="m-left">搜索</span></a>' +
    '<span id="js-page"></span>'
  );

  // 搜索触发
  $("#js-search").click(function () {
    const search = $("#search").val();
    // alert(search);
    fnSearch(search);
  });
})();
