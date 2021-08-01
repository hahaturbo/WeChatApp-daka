const promisify = (fn) => {
  return async (params) => {
    return new Promise((resolve, reject) => {
      fn({
        ...(params || {}),
        success: (result) => resolve(result),
        fail: (err) => reject(err)
      })
    })
  }
}

const toAsync = (...names) => {
  return names.reduce((pre, cur) => {
    if (typeof wx[cur] === "function") {
      pre[cur] = promisify(wx[cur])
      return pre
    }
  }, {})
}

export {
  toAsync
}