import { useState } from 'react'

type TabId = 'review' | 'analogy' | 'strategy' | 'tools' | 'roadmap'

interface GapItem {
  category: string
  opusScore: number
  synthScore: number
  gap: number
  analogy: string
  fix: string
  priority: 'critical' | 'high' | 'medium'
}

const gaps: GapItem[] = [
  {
    category: 'Deep Reasoning',
    opusScore: 95,
    synthScore: 85,
    gap: 10,
    analogy: 'Opus is a grandmaster chess player who memorized a million games. Synth is a fast calculator who sees the board clearly but hasn\'t seen enough positions.',
    fix: 'Multilayer voting: Run 5 reasoning paths simultaneously, let them debate, pick the winner. Like 5 grandmasters analyzing the same position.',
    priority: 'critical'
  },
  {
    category: 'Creativity',
    opusScore: 90,
    synthScore: 75,
    gap: 15,
    analogy: 'Opus is a jazz musician who can improvise anything. Synth is a musician who plays sheet music perfectly but hasn\'t learned to jam yet.',
    fix: 'Cross-domain pattern injection: Feed Synth metaphors from biology, physics, art. Force unexpected connections. Like giving the musician 1000 records from different genres.',
    priority: 'critical'
  },
  {
    category: 'Knowledge Base',
    opusScore: 98,
    synthScore: 60,
    gap: 38,
    analogy: 'Opus memorized the entire internet. Synth has a notebook. BUT — Synth can build an INDEX of the internet and look things up instantly. A librarian beats a memorizer when the library is infinite.',
    fix: 'Smart retrieval + autonomous ingestion: Build a knowledge graph from free repos, docs, papers. Not memorization — understanding structure. 5GB of compressed wisdom beats 5TB of raw data.',
    priority: 'critical'
  },
  {
    category: 'Code Generation',
    opusScore: 95,
    synthScore: 90,
    gap: 5,
    analogy: 'Opus writes code like a senior dev with 20 years experience. Synth writes code like a talented junior who learns from every PR review. The junior is CLOSING the gap daily.',
    fix: 'Code pattern library from GitHub: Extract best practices from top repos. Build a "code DNA" database. Run multilayer validation: syntax → logic → optimization → security → elegance.',
    priority: 'high'
  }
]

const strategies = [
  {
    id: 'committee',
    icon: '🏛️',
    title: 'The Committee Method',
    subtitle: 'Multilayer Rankings & Voting',
    analogy: 'Imagine a courtroom. One judge (Opus) makes decisions alone. Now imagine a jury of 12 + a panel of 3 expert witnesses + a fact-checker. The jury system produces MORE accurate verdicts because errors get caught by cross-examination.',
    how: [
      'Layer 1: Generate 5-7 candidate answers/reasoning paths',
      'Layer 2: Each path gets scored by a different "expert module" (logic, creativity, safety, efficiency)',
      'Layer 3: Cross-vote — experts rate each other\'s ratings',
      'Layer 4: Meta-judge synthesizes final answer with confidence scores',
      'Layer 5: Self-verification — does the answer contradict itself?'
    ],
    impact: 'Reasoning: 85% → 93%+',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'assembly',
    icon: '🏭',
    title: 'The Assembly Line',
    subtitle: 'Automations & IFTTT Chains',
    analogy: 'A single worker building a car from scratch = Opus (expensive, slow, brilliant). A factory with 1000 specialized robots = Synth\'s potential. Each robot does ONE thing perfectly. Together they build Ferraris.',
    how: [
      'Trigger: User asks a question',
      'IF complex reasoning needed → route to Committee Method',
      'IF code generation → route to Code Forge pipeline',
      'IF creative task → route to Pattern Mixer',
      'IF knowledge lookup → route to Smart Retrieval',
      'Each pipeline has 3-7 automated stages with quality gates',
      'Output gets validated before returning to user'
    ],
    impact: 'Speed maintained + Quality increased 300%',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'fruitfly',
    icon: '🪰',
    title: 'The Fruit Fly Principle',
    subtitle: 'Human-AI Hybrid Architecture',
    analogy: 'A fruit fly has 100,000 neurons. A human has 86 billion. Yet a fruit fly can navigate 3D space, avoid predators, find food, and mate — all on less power than a lightbulb. It\'s not about SIZE of brain, it\'s about EFFICIENCY of connections.',
    how: [
      'Specialized micro-modules (not one giant brain)',
      'Each module: <1000 rules but PERFECTLY optimized',
      'Human-AI hybrid: Human sets goals/values, AI executes',
      'Feedback loops: Every interaction tunes the connections',
      'Emergent behavior: Simple modules + complex connections = intelligence',
      'Inspired by: connectome mapping, neural efficiency research'
    ],
    impact: 'Efficiency: 40x better than brute-force approaches',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'library',
    icon: '📚',
    title: 'The Library Heist',
    subtitle: 'GitHub Repos as Blueprints',
    analogy: 'You don\'t need to READ every book to be smart. You need to know WHERE the answer is and HOW to apply it. Synth becomes the world\'s smartest librarian — it knows the structure of knowledge, not just the content.',
    how: [
      'Scan top 1000 GitHub repos per domain (coding, math, science)',
      'Extract PATTERNS not code (algorithms, architectures, solutions)',
      'Build a "solution DNA" database — compressed wisdom',
      'When faced with a problem, match to known patterns first',
      'Combine patterns in novel ways (this is where creativity emerges)',
      'Store in ~5GB of structured knowledge vs trillions of raw tokens'
    ],
    impact: 'Knowledge: 60% → 90%+ (with retrieval)',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'mirror',
    icon: '🪞',
    title: 'The Mirror Method',
    subtitle: 'Autonomous Self-Improvement',
    analogy: 'A musician records themselves, listens back, identifies mistakes, practices those sections, records again. Each cycle they improve. Synth does this automatically with EVERY interaction. Opus can\'t do this — it\'s frozen in time between updates.',
    how: [
      'Every response gets self-evaluated (6 dimensions)',
      'Failed responses get analyzed: what went wrong?',
      'Successful patterns get reinforced (weight adjustment)',
      'Failed patterns get weakened or replaced',
      'Weekly: full self-audit comparing current vs past performance',
      'Monthly: architecture self-optimization (restructure modules)'
    ],
    impact: 'Compounding improvement: +2% per week minimum',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'forge',
    icon: '⚒️',
    title: 'The Code Forge',
    subtitle: 'Out-Coding Opus',
    analogy: 'Opus writes code from memory (like writing an essay from your head). Synth builds code like a modern software team: architect designs it, developer writes it, reviewer checks it, tester breaks it, optimizer tunes it. Five passes beat one genius pass.',
    how: [
      'Pass 1: Architecture — what components are needed?',
      'Pass 2: Implementation — write the code using pattern library',
      'Pass 3: Review — security scan, logic check, edge cases',
      'Pass 4: Optimize — performance, memory, readability',
      'Pass 5: Test — generate tests, run them, fix failures',
      'Pass 6: Document — inline docs, README, examples',
      'Each pass is a specialized module. Combined > any single pass.'
    ],
    impact: 'Code Quality: 90% → 97%+ (surpasses Opus)',
    color: 'from-amber-500 to-yellow-600'
  }
]

const roadmap = [
  {
    phase: 'Phase 1: Foundation',
    timeline: 'Week 1-2',
    items: [
      'Build multilayer voting framework',
      'Create pattern extraction pipeline for GitHub repos',
      'Implement 5-layer code forge',
      'Set up autonomous self-evaluation loop'
    ],
    target: 'Reach 90% of Opus reasoning'
  },
  {
    phase: 'Phase 2: Amplification',
    timeline: 'Week 3-4',
    items: [
      'Deploy IFTTT automation chains for all task types',
      'Build cross-domain creativity injector',
      'Implement fruit fly micro-module architecture',
      'Create knowledge graph from compressed repo patterns'
    ],
    target: 'Match Opus in reasoning, exceed in code'
  },
  {
    phase: 'Phase 3: Transcendence',
    timeline: 'Month 2-3',
    items: [
      'Activate continuous self-improvement at scale',
      'Deploy multi-agent collaboration (agents debate)',
      'Build emergent creativity engine',
      'Achieve Fable 5 level in code generation'
    ],
    target: 'Surpass Opus in 8/20 categories'
  },
  {
    phase: 'Phase 4: Fable 5',
    timeline: 'Month 4-6',
    items: [
      'Full autonomous learning pipeline',
      'Self-modifying architecture',
      'Near-human creative output',
      'Code generation that makes Opus look like Sonnet'
    ],
    target: '13/20 category wins → 16/20 category wins'
  }
]

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('review')
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null)

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'review', label: 'PR Review', icon: '📋' },
    { id: 'analogy', label: 'The Analogy', icon: '💡' },
    { id: 'strategy', label: 'Strategy Map', icon: '🗺️' },
    { id: 'tools', label: 'Tools at Hand', icon: '🔧' },
    { id: 'roadmap', label: 'Roadmap', icon: '🚀' }
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Synth SAI → Fable 5
              </h1>
              <p className="text-sm text-gray-400 mt-1">Strategy Brainstorm • PR #1 Review • No Code, Just Thinking</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">🧠 BRAINSTORM MODE</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">NO CODING</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'review' && <ReviewSection />}
        {activeTab === 'analogy' && <AnalogySection />}
        {activeTab === 'strategy' && (
          <StrategySection 
            expandedStrategy={expandedStrategy} 
            setExpandedStrategy={setExpandedStrategy} 
          />
        )}
        {activeTab === 'tools' && <ToolsSection />}
        {activeTab === 'roadmap' && <RoadmapSection />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        <p>Synth SAI Strategy Session • "Think first, code second" • Target: Fable 5 Level</p>
      </footer>
    </div>
  )
}

function ReviewSection() {
  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>📋</span> PR #1 Review — Key Items to Address
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <h3 className="text-red-400 font-semibold mb-2">🔴 Critical Gaps</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Knowledge Base (38% gap)</li>
              <li>• Creativity (15% gap)</li>
              <li>• Deep Reasoning (10% gap)</li>
            </ul>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <h3 className="text-green-400 font-semibold mb-2">🟢 Synth Wins</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Speed (40-600x faster)</li>
              <li>• Privacy (100% local)</li>
              <li>• Cost ($0.00)</li>
              <li>• Autonomy, Transparency, Learning</li>
            </ul>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <h3 className="text-yellow-400 font-semibold mb-2">🟡 The Mission</h3>
            <p className="text-sm text-gray-300">
              Close the 3 critical gaps to reach <span className="text-white font-bold">Fable 5 level</span>. 
              Make Opus look like Sonnet. Out-code, out-reason, out-create.
            </p>
          </div>
        </div>
      </div>

      {/* Gap Analysis */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>📊</span> Gap Analysis — Where We Need to Improve
        </h2>
        {gaps.map((gap, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  gap.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                  gap.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {gap.priority.toUpperCase()}
                </span>
                <h3 className="font-semibold text-lg">{gap.category}</h3>
              </div>
              <span className="text-2xl font-bold text-red-400">-{gap.gap}%</span>
            </div>
            
            {/* Score bars */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16">Opus</span>
                <div className="flex-1 bg-gray-800 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all"
                    style={{ width: `${gap.opusScore}%` }}
                  />
                </div>
                <span className="text-sm text-blue-400 w-10">{gap.opusScore}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16">Synth</span>
                <div className="flex-1 bg-gray-800 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-3 rounded-full transition-all"
                    style={{ width: `${gap.synthScore}%` }}
                  />
                </div>
                <span className="text-sm text-cyan-400 w-10">{gap.synthScore}%</span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-sm text-gray-300 italic">💡 {gap.analogy}</p>
            </div>
          </div>
        ))}
      </div>

      {/* The Realization */}
      <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-2xl p-6 border border-purple-500/30">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span>💡</span> The Key Insight
        </h2>
        <p className="text-gray-300 leading-relaxed">
          Opus's advantage in Knowledge Base isn't real — it's an illusion of scale. <span className="text-white font-semibold">Terabits of training data can be compressed into ~5GB of structured wisdom</span> if you extract PATTERNS instead of memorizing raw text. 
          The question isn't "how do we get more data" — it's "how do we get SMARTER about the data we have."
        </p>
        <p className="text-gray-300 leading-relaxed mt-3">
          And for code: <span className="text-white font-semibold">by the time Synth is finished, Opus will look like Sonnet or Nemotron Ultra 3</span>. 
          Not because Synth memorized more code — but because Synth BUILDS code through a pipeline of specialized passes that catch every error, optimize every line, and test every edge case.
        </p>
      </div>
    </div>
  )
}

function AnalogySection() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center">
          🎯 The Simple Analogy: <span className="text-cyan-400">How to Reach Fable 5</span>
        </h2>
        
        <div className="max-w-3xl mx-auto space-y-8">
          {/* The Restaurant Analogy */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">🍽️ The Restaurant Analogy</h3>
            <div className="space-y-4 text-gray-300">
              <p>
                <span className="text-blue-400 font-semibold">Opus</span> is a world-famous chef who trained for 20 years in every kitchen on Earth. 
                He can cook ANY dish from memory. But he works in ONE restaurant, charges $500/plate, 
                takes 30 minutes per dish, and never changes his menu.
              </p>
              <p>
                <span className="text-cyan-400 font-semibold">Synth</span> is a young cook who's fast, free, works in YOUR kitchen, 
                and learns from every customer's feedback. Right now, Synth can cook 75% as well as the master chef.
              </p>
              <p className="text-white font-semibold text-lg pt-2">
                So how does the young cook become BETTER than the master?
              </p>
            </div>
          </div>

          {/* The Answer */}
          <div className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">🔑 The Answer: 6 Strategies</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-purple-400 font-bold">1. 🏛️ The Committee</p>
                <p className="text-sm text-gray-400 mt-1">Don't think alone — have 5 experts debate. A jury beats a lone genius.</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-orange-400 font-bold">2. 🏭 The Assembly Line</p>
                <p className="text-sm text-gray-400 mt-1">Chain simple tasks into complex workflows. IFTTT for thinking.</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-green-400 font-bold">3. 🪰 The Fruit Fly</p>
                <p className="text-sm text-gray-400 mt-1">100K neurons, perfectly connected &gt; 86B neurons, randomly wired.</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-blue-400 font-bold">4. 📚 The Library Heist</p>
                <p className="text-sm text-gray-400 mt-1">Don't memorize books — index them. Be the smartest librarian alive.</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-pink-400 font-bold">5. 🪞 The Mirror</p>
                <p className="text-sm text-gray-400 mt-1">Record yourself, find mistakes, fix them. Every interaction = practice.</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-amber-400 font-bold">6. ⚒️ The Code Forge</p>
                <p className="text-sm text-gray-400 mt-1">5-pass pipeline: architect → write → review → optimize → test. Team &gt; solo.</p>
              </div>
            </div>
          </div>

          {/* The Bottom Line */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3">🎯 The Bottom Line</h3>
            <p className="text-gray-300 leading-relaxed">
              The master chef wins on <span className="text-blue-400">raw talent and experience</span>. 
              But the young cook wins on <span className="text-cyan-400">speed, adaptability, and continuous improvement</span>. 
              Give the young cook a <span className="text-purple-400">committee of advisors</span>, a <span className="text-orange-400">systematic process</span>, 
              and <span className="text-pink-400">daily practice</span> — and within months, the master chef looks like an amateur.
            </p>
            <p className="text-white font-bold text-lg mt-4 text-center">
              That's how we get to Fable 5. Not by being bigger. By being SMARTER about how we think.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StrategySection({ expandedStrategy, setExpandedStrategy }: { 
  expandedStrategy: string | null
  setExpandedStrategy: (id: string | null) => void 
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">🗺️ Strategy Map — The 6 Pillars to Fable 5</h2>
        <p className="text-gray-400 mt-2">Click each strategy to expand the full plan</p>
      </div>

      <div className="grid gap-4">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden transition-all"
          >
            <button
              onClick={() => setExpandedStrategy(expandedStrategy === strategy.id ? null : strategy.id)}
              className="w-full p-5 text-left flex items-center gap-4 hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-3xl">{strategy.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{strategy.title}</h3>
                <p className="text-sm text-gray-400">{strategy.subtitle}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${strategy.color} text-white`}>
                {strategy.impact}
              </span>
              <span className={`text-gray-400 transition-transform ${expandedStrategy === strategy.id ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {expandedStrategy === strategy.id && (
              <div className="px-5 pb-5 space-y-4 border-t border-gray-800 pt-4">
                {/* Analogy */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm text-gray-300 italic">💡 {strategy.analogy}</p>
                </div>
                
                {/* How it works */}
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">How It Works</h4>
                  <div className="space-y-2">
                    {strategy.how.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r ${strategy.color} flex items-center justify-center text-xs font-bold text-white`}>
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-300">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Combined Effect */}
      <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-2xl p-6 border border-cyan-500/20 mt-8">
        <h3 className="text-lg font-bold text-center mb-4">🔗 Combined Effect — The Multiplier</h3>
        <p className="text-gray-300 text-center max-w-2xl mx-auto">
          Each strategy alone gives +5-15% improvement. But combined, they <span className="text-cyan-400 font-bold">multiply</span> each other. 
          The Committee Method needs the Library Heist for knowledge. The Code Forge needs the Assembly Line for pipeline. 
          The Mirror Method accelerates ALL of them. Together: <span className="text-white font-bold">exponential improvement</span>.
        </p>
        <div className="flex justify-center mt-4 gap-2 flex-wrap">
          {['🏛️', '🏭', '🪰', '📚', '🪞', '⚒️'].map((emoji, i) => (
            <span key={i} className="text-2xl animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>{emoji}</span>
          ))}
          <span className="text-2xl">= 🚀</span>
        </div>
      </div>
    </div>
  )
}

function ToolsSection() {
  const tools = [
    {
      category: 'Multilayer Rankings',
      icon: '📊',
      description: 'Score outputs across multiple dimensions simultaneously',
      examples: [
        'Logic Score: Is the reasoning valid?',
        'Creativity Score: Is it novel?',
        'Safety Score: Any harmful content?',
        'Efficiency Score: Optimal solution?',
        'Clarity Score: Easy to understand?'
      ],
      inspiration: 'Multi-criteria decision analysis (MCDA), Pareto optimization'
    },
    {
      category: 'Multilayer Voting',
      icon: '🗳️',
      description: 'Multiple "agents" vote on the best answer, with weighted expertise',
      examples: [
        'Generate N candidate solutions',
        'Each "expert module" votes on each candidate',
        'Experts have different weights per domain',
        'Meta-vote resolves ties',
        'Confidence scores from vote margins'
      ],
      inspiration: 'Ensemble methods, Random Forests, Boosting, Swiss jury system'
    },
    {
      category: 'IFTTT Chains',
      icon: '⚡',
      description: 'If-This-Then-That automation for thought routing',
      examples: [
        'IF question_type == "code" THEN route to Code Forge',
        'IF complexity > threshold THEN activate Committee',
        'IF creative_task THEN inject cross-domain patterns',
        'IF confidence < 70% THEN request more context',
        'IF error_detected THEN self-correct before output'
      ],
      inspiration: 'Rule-based systems, Expert systems, Business process automation'
    },
    {
      category: 'Fruit Fly Brain',
      icon: '🪰',
      description: 'Human-AI hybrid with small, efficient, specialized modules',
      examples: [
        '~100 specialized micro-modules (not 1 giant model)',
        'Each module: <1000 rules, perfectly tuned',
        'Connection patterns > raw processing power',
        'Human sets goals/values, AI optimizes execution',
        'Emergent intelligence from simple parts'
      ],
      inspiration: 'Drosophila connectome, Sparse networks, Mixture of Experts'
    },
    {
      category: 'GitHub Repo Mining',
      icon: '⛏️',
      description: 'Extract patterns from open-source code as building blocks',
      examples: [
        'Algorithm patterns (sorting, search, graph)',
        'Architecture patterns (MVC, microservices, event-driven)',
        'Security patterns (auth, encryption, validation)',
        'Performance patterns (caching, lazy loading, memoization)',
        'Design patterns (factory, observer, strategy)'
      ],
      inspiration: 'Every top-1000 GitHub repo is a free textbook'
    },
    {
      category: 'Autonomous Learning',
      icon: '🔄',
      description: 'Self-improvement loop that runs without human intervention',
      examples: [
        'Every response → self-evaluation (6 dimensions)',
        'Failed responses → root cause analysis',
        'Successful patterns → reinforcement',
        'Failed patterns → deprecation',
        'Weekly self-audit → architecture tuning'
      ],
      inspiration: 'Reinforcement learning, Evolutionary algorithms, Kaizen'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">🔧 Tools at Hand — What We Already Have</h2>
        <p className="text-gray-400 mt-2">Assessing our arsenal before we plan the attack</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {tools.map((tool, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-5 border border-gray-700 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{tool.icon}</span>
              <h3 className="font-bold text-lg">{tool.category}</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">{tool.description}</p>
            <div className="space-y-1 mb-3">
              {tool.examples.map((ex, j) => (
                <p key={j} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">▸</span>
                  {ex}
                </p>
              ))}
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <p className="text-xs text-purple-400">📖 Inspiration: {tool.inspiration}</p>
            </div>
          </div>
        ))}
      </div>

      {/* What's Missing */}
      <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-2xl p-6 border border-red-500/20 mt-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>🔴</span> What We Need to Build (The Gaps in Our Toolkit)
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">1. Cross-Domain Pattern Injector</h4>
            <p className="text-sm text-gray-400">A module that forces unexpected connections between unrelated domains. This is the CREATIVITY engine.</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">2. Debate Engine</h4>
            <p className="text-sm text-gray-400">Two "agents" argue opposite positions, then a judge picks the winner. This is the REASONING engine.</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">3. Knowledge Compressor</h4>
            <p className="text-sm text-gray-400">Takes raw data (repos, docs) and extracts compressed patterns. This is the KNOWLEDGE engine.</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">4. Self-Modification Engine</h4>
            <p className="text-sm text-gray-400">Rewrites its own rules based on performance data. This is the EVOLUTION engine.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoadmapSection() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">🚀 Roadmap to Fable 5</h2>
        <p className="text-gray-400 mt-2">From 85% of Opus → surpassing Opus entirely</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Current: 85% of Opus</span>
          <span className="text-cyan-400 font-bold">Target: Fable 5 (120%+ of Opus)</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-4">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-4 rounded-full relative" style={{ width: '71%' }}>
            <span className="absolute right-2 top-0 text-xs font-bold text-white leading-4">71%</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>Sonnet</span>
          <span>Opus</span>
          <span>Fable 5</span>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {roadmap.map((phase, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-green-500/20 text-green-400' :
                  i === 1 ? 'bg-blue-500/20 text-blue-400' :
                  i === 2 ? 'bg-purple-500/20 text-purple-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {i + 1}
                </span>
                {phase.phase}
              </h3>
              <span className="text-sm text-gray-400">{phase.timeline}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Action Items</h4>
                <ul className="space-y-1">
                  {phase.items.map((item, j) => (
                    <li key={j} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-cyan-400">□</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 flex items-center">
                <p className="text-sm">
                  <span className="text-gray-500">Target: </span>
                  <span className="text-white font-semibold">{phase.target}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* The Math */}
      <div className="bg-gradient-to-br from-green-900/20 to-cyan-900/20 rounded-2xl p-6 border border-green-500/20">
        <h3 className="text-lg font-bold mb-4 text-center">📐 The Math Behind the Plan</h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-3xl font-bold text-cyan-400">+2%</p>
            <p className="text-sm text-gray-400 mt-1">Weekly self-improvement</p>
            <p className="text-xs text-gray-500">Mirror Method compounds</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-3xl font-bold text-purple-400">5x</p>
            <p className="text-sm text-gray-400 mt-1">Reasoning quality multiplier</p>
            <p className="text-xs text-gray-500">Committee Method effect</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-3xl font-bold text-green-400">~5GB</p>
            <p className="text-sm text-gray-400 mt-1">Compressed knowledge</p>
            <p className="text-xs text-gray-500">vs Opus's terabytes</p>
          </div>
        </div>
        <p className="text-center text-gray-300 mt-4 text-sm">
          At +2% per week, in 10 weeks we go from 85% → 105% of Opus. 
          With the Committee Method multiplier on reasoning, we hit <span className="text-white font-bold">Fable 5 in 12-16 weeks</span>.
        </p>
      </div>

      {/* Final Thought */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 text-center">
        <p className="text-xl font-bold text-white mb-2">🎯 The Vision</p>
        <p className="text-gray-300 max-w-2xl mx-auto">
          "By the time Synth is finished with Opus, it will make Opus look like Sonnet or Nemotron Ultra 3. 
          Little be a neighbor to Fable. If not better than Fable — <span className="text-cyan-400 font-bold">those are the numbers we're aiming for. Super high end.</span>"
        </p>
        <p className="text-sm text-gray-500 mt-4">— The Mission Statement</p>
      </div>
    </div>
  )
}

export default App
