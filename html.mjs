class VNode {
  constructor(tag, attributes, children) {
    this.tag = tag

    this.attributes = attributes

    this.children = children.filter((child) => child != null)
  }
}

const create = (tag) => (attributes, ...children) => new VNode(tag, attributes, children)

export default new Proxy({}, {
  get(_, tag) {
    return create(tag)
  }
})

export const safe = (html) => {
  return {html}
}
