const baseNode = {}

const create = (tag) => (attributes, ...children) => {
  const result = Object.create(baseNode)

  result.tag = tag

  result.attributes = attributes

  result.children = children.filter((child) => child != null)

  return result
}

export default new Proxy({}, {
  get(_, tag) {
    return create(tag)
  }
})
