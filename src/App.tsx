import { useMemo, useState } from 'react'
import { PredictProvider, PredictOverlays, PredictTab, usePredictHost, type HostBridge, type HostTab } from './predict'
import { BottomNav, Header, StatusBar } from './shell/Chrome'
import { Forside } from './shell/pages/Forside'
import { Seneste } from './shell/pages/Seneste'
import { Video } from './shell/pages/Video'
import { Menu } from './shell/pages/Menu'

const TAB_KEY = 'drnyheder:tab'
const TABS: HostTab[] = ['forside', 'seneste', 'video', 'spil', 'menu']

function loadTab(): HostTab {
  try {
    const t = localStorage.getItem(TAB_KEY) as HostTab | null
    if (t && TABS.includes(t)) return t
  } catch {
    /* ignore */
  }
  return 'forside'
}

function Screen({ tab, setTab }: { tab: HostTab; setTab: (t: HostTab) => void }) {
  const host = usePredictHost()
  const dark = tab === 'video'
  return (
    <div className={`relative flex h-full flex-col overflow-hidden ${dark ? 'bg-black' : 'bg-white'}`}>
      <StatusBar dark={dark} />
      {!dark && <Header onLongPress={host.openDemo} />}
      {tab === 'spil' && (
        <div className="flex h-[52px] shrink-0 items-end border-b border-[#E6E6E6] bg-white px-4">
          <span className="border-b-[3px] border-black px-2 pb-2.5 text-[16px] font-bold">DR Predict</span>
        </div>
      )}
      <main className="relative min-h-0 flex-1">
        {tab === 'video' ? (
          <Video />
        ) : (
          <div key={tab} data-scroll className="no-scrollbar h-full overflow-y-auto overflow-x-hidden overscroll-contain">
            {tab === 'forside' && <Forside onOpenSeneste={() => setTab('seneste')} />}
            {tab === 'seneste' && <Seneste onToast={host.toast} />}
            {tab === 'spil' && <PredictTab />}
            {tab === 'menu' && <Menu onToast={host.toast} />}
          </div>
        )}
      </main>
      <BottomNav tab={tab} onChange={(t) => (t === 'spil' && tab === 'spil' ? host.openTab() : setTab(t))} dark={dark} />
      <div className="pointer-events-none absolute inset-0 z-40 md:top-[46px]">
        <PredictOverlays />
      </div>
    </div>
  )
}

export default function App() {
  const [tab, setTabState] = useState<HostTab>(loadTab)
  const host: HostBridge = useMemo(
    () => ({
      tab,
      setTab: (t: HostTab) => {
        setTabState(t)
        try {
          localStorage.setItem(TAB_KEY, t)
        } catch {
          /* ignore */
        }
      },
    }),
    [tab],
  )

  return (
    <PredictProvider host={host}>
      <div className="flex min-h-full items-center justify-center md:p-5">
        <div className="h-[100dvh] w-full md:h-[min(844px,calc(100dvh-40px))] md:w-[390px] md:overflow-hidden md:rounded-[52px] md:border-[11px] md:border-black md:shadow-[0_30px_80px_-20px_rgba(0,0,0,.45)]">
          <Screen tab={tab} setTab={host.setTab} />
        </div>
      </div>
    </PredictProvider>
  )
}
