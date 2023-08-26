
export const config = {
  func: {
    sortPosts: (a: any, b: any) => b.data.updateDate - a.data.updateDate,
  }
}
