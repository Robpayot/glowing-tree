export default function bindAll(...args) {
  if (args.length < 2 || typeof args[0] !== 'object') {
    throw Error('Function expects object, method, method etc.')
  }
  const instance = args.shift()
  const methods = args
  for (let i = 0, limit = methods.length; i < limit; i++) {
    const method = methods[i]
    instance[method] = instance[method].bind(instance)
  }
}
