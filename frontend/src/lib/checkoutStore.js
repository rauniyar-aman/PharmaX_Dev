// In-memory store for staged prescription files during checkout.
// File objects can't be serialized to sessionStorage, so they live here.
// The store survives React Router navigation but is cleared on page reload (intentional).
const checkoutStore = {
  staged: {}, // { [medId]: { files: File[], fileName: string } }

  stage(medId, files) {
    this.staged[medId] = { files, fileName: files.map(f => f.name).join(', ') }
  },
  get(medId) { return this.staged[medId] || null },
  remove(medId) { delete this.staged[medId] },
  hasStaged() { return Object.keys(this.staged).length > 0 },
  clear() { this.staged = {} },
}

export default checkoutStore
