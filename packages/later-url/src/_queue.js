// 执行队列，第二个参数控制是否循环执行
async function runQueue(listPromises, loop = 0) {
  // console.log(listPromises);
  for (let itemPromise of listPromises) {
    await itemPromise();
  }
  if (loop) {
    await runQueue(listPromises, loop);
  }
}

// 返回项为一个函数，该函数调用时会建立一个 Promise 对象并立即执行
// 当内部调用 solve() 时表示该异步项执行结束
const createPromise = (cb, ...args) => {
  return () => new Promise((resolve, reject) => {
    cb(...args).then((res) => {
      resolve(res);
    }).catch((error) => {
      reject(error);
    });
  });
};

// 构造任务队列
const createQueue = (arr, cb, ...args) => {
  return arr.map((item) => {
    return createPromise(cb, item, ...args);
  });
};

export {
  createPromise,
  createQueue,
  runQueue,
};
