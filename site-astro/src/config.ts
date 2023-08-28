
export const config = {
  site:{
    title: "wdssmq/userscript",
    description: "各种「GM_脚本」",
  },
  func: {
    sortPosts: (a: any, b: any) => b.data.updateDate - a.data.updateDate,
  }
}
