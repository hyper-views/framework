module.exports = function (commit) {
  commit(() => {
    return {
      location: '/heading-1.html',
      heading: 'Heading 1'
    }
  })

  commit(() => {
    return {
      location: '/heading-2.html',
      heading: 'Heading 2'
    }
  })
}
