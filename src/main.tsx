import { render } from 'preact'
import './index.css'
import { App } from './app.tsx'
import { UpdateBanner } from './components/UpdateBanner.tsx'

render(
  <>
    <UpdateBanner />
    <App />
  </>,
  document.getElementById('app')!,
)
