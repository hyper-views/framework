const create = (tag) => (attributes, ...children) => {
  return {
    tag,
    attributes,
    children: children.filter((child) => child != null)
  }
}

export default new Proxy({}, {
  get(_, tag) {
    return create(tag)
  }
})

export const safe = (html) => {
  return {html}
}
