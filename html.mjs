const create = (tag) => (attributes, ...children) => {
  const result = {}

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

export const safe = (html) => {
  return {html}
}
