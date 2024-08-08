import genesyLogo from './assets/genesy-ai-logo.svg'
import { LeadsList } from './components/LeadsList/LeadsList'

function App() {
  return (
    <main className="main">
      <div>
        <a href="https://genesy.ai" target="_blank">
          <img src={genesyLogo} className="logo genesy" alt="Genesy AI logo" />
        </a>
      </div>
      <h1 className="title">Genesy AI</h1>
      <LeadsList />
    </main>
  )
}

export default App
