// The /kundli panes are React.lazy chunks. On a cold module graph the first
// import() has to transform each one, which under a loaded machine (two
// suites at once, CI) can outlast a test's findBy/waitFor window. Import
// them once up front, in beforeAll, so tests only wait for rendering.
// A file's vi.mock() of any of these still applies: this goes through the
// same module registry.
export async function preloadKundliChunks() {
  await Promise.all([
    import('../components/KPChart'),
    import('../components/DivisionalCharts'),
    import('../components/TransitPanel'),
    import('../components/BhavaChalit'),
    import('../components/AshtakavargaTable'),
    import('../components/SarvatobhadraChakra'),
    import('../components/KundliDownload'),
  ])
}

// beforeAll hook timeout: the cold transform is the slow part.
export const PRELOAD_TIMEOUT_MS = 30000
