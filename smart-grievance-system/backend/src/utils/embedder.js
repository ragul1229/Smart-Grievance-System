// Lightweight embedder using Universal Sentence Encoder
// Lazy-require the USE model so the server can start even if the package isn't installed.
let use

// Try to load the fast native backend (tfjs-node); fall back to pure JS (`@tensorflow/tfjs`) if unavailable.
let tf
try {
  tf = require('@tensorflow/tfjs-node')
} catch (err) {
  console.warn('`@tensorflow/tfjs-node` not available, falling back to `@tensorflow/tfjs` (slower).')
  try {
    tf = require('@tensorflow/tfjs')
  } catch (err2) {
    console.warn('`@tensorflow/tfjs` is also not available. Embedding functionality will be disabled.')
    tf = null
  }
}

let model = null

async function init() {
  if (model) return model
  if (!tf) throw new Error('TensorFlow backend not available')
  try {
    use = require('@tensorflow-models/universal-sentence-encoder')
  } catch (err) {
    throw new Error('`@tensorflow-models/universal-sentence-encoder` not installed')
  }

  console.log('Loading USE model for embeddings (this may take a moment)...')
  model = await use.load()
  console.log('USE model loaded')
  return model
}

async function embedTexts(texts = []) {
  if (!model) await init()
  if (!Array.isArray(texts)) texts = [texts]
  const embeddings = await model.embed(texts)
  const arr = await embeddings.array()
  embeddings.dispose && embeddings.dispose()
  return arr
}

module.exports = { init, embedTexts }
