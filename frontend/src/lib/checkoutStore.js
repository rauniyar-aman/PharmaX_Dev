const checkoutStore = {
  staged: {},

  stage(medId, files) {
    this.staged[medId] = { files, fileName: files.map(f => f.name).join(', ') }
  },
  get(medId) { return this.staged[medId] || null },
  remove(medId) { delete this.staged[medId] },
  hasStaged() { return Object.keys(this.staged).length > 0 },
  clear() { this.staged = {} },
}

export default checkoutStore
