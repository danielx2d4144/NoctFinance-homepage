import { Interactions } from "./interactions";

// Pre-rebrand repo slug. GitHub 301s renamed repos permanently, so this keeps
// working — swap it once the protocol repo is renamed.
const GITHUB = "https://github.com/danielx2d4144/zenfinance_privacy";
const WAITLIST =
  "mailto:danielwork4144@gmail.com?subject=NoctFinance%20waitlist&body=Wallet%20or%20contact%20(optional)%3A%0AWhat%20I%27d%20use%20private%20lending%20for%3A";

const TICKER_ITEMS = [
  "shielded positions",
  "zk-verified solvency",
  "0 bytes of position data leaked",
  "in-browser proving",
  "agent-native erc-4337",
  "proofs over promises",
];

export default function Home() {
  return (
    <>
      {/* ticker */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((half) =>
            TICKER_ITEMS.map((item, i) => (
              <span key={`${half}-${i}`} className="tick-item">
                <span>{item}</span>
                <i>·</i>
              </span>
            )),
          )}
        </div>
      </div>

      {/* nav */}
      <header className="nav" id="nav">
        <a className="wordmark" href="#top">
          <span className="wordmark-tick" />
          NoctFinance
        </a>
        <nav className="nav-links">
          <a href="#proof">Proof</a>
          <a href="#spec">Protocol</a>
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
          <a className="nav-gh" href={GITHUB} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </nav>
        <a className="btn btn-gradient btn-sm" href="#waitlist">
          Join the waitlist
        </a>
      </header>

      <main id="top">
        {/* hero */}
        <section className="hero" id="hero">
          <div className="hero-spot" id="spot" aria-hidden="true" />
          <p className="kicker reveal">
            {"// SIGNAL / NOISE"}&nbsp;&nbsp;·&nbsp;&nbsp;PRIVACY-PRESERVING MONEY MARKET
          </p>
          <h1 className="reveal">
            Lend and borrow on-chain —{" "}
            <span className="decrypt-wrap">
              <span className="decrypt" id="decrypt" data-text="without broadcasting">
                without broadcasting
              </span>
              <span className="grad-underline" id="underline" />
            </span>{" "}
            your balance sheet.
          </h1>
          <p className="sub reveal">
            A privacy-preserving money market. Zero-knowledge proofs verify every position
            — without revealing it.
          </p>
          <div className="cta-row reveal">
            <a className="btn btn-gradient" href="#waitlist">
              Join the waitlist
            </a>
            <a className="btn btn-outline" href={GITHUB} target="_blank" rel="noopener noreferrer">
              Read the docs
            </a>
          </div>

          <div className="stats reveal" id="stats">
            <div className="stat">
              <em className="count" data-target="224" data-suffix="/224">
                224/224
              </em>
              <label>tests passing</label>
            </div>
            <div className="stat">
              <em className="count" data-target="11">
                11
              </em>
              <label>circuits compiled</label>
            </div>
            <div className="stat">
              <em>
                100<span className="pct">%</span>
              </em>
              <label>client-side proving</label>
            </div>
            <div className="stat">
              <em className="count" data-target="0" data-suffix=" bytes">
                0 bytes
              </em>
              <label>position data leaked</label>
            </div>
          </div>
        </section>

        {/* proof of build */}
        <section className="section" id="proof">
          <p className="kicker reveal">{"// PROOF OF BUILD"}</p>
          <div className="split">
            <div className="reveal">
              <h2>
                We ship proofs,
                <br />
                not promises.
              </h2>
              <p className="body">
                Every claim on this page is checked in the repo. The circuits are compiled,
                the verification keys are pinned, and the prover runs in your browser —
                your secrets never touch our servers, because there are none.
              </p>
            </div>
            <div className="terminal reveal" id="terminal">
              <div className="term-bar">
                <span className="dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="term-title">noctfinance — ci · main</span>
              </div>
              <div className="term-body">
                {/* Server-rendered content so crawlers and no-JS visitors see it;
                    the typewriter clears and retypes these lines on scroll. */}
                <p className="term-line" data-cmd="forge test" data-out="224/224 tests <b>PASS</b>">
                  <span className="cmd">forge test</span>
                  <span className="out">
                    224/224 tests <b>PASS</b>
                  </span>
                </p>
                <p className="term-line" data-cmd="circuits" data-out="11 compiled · vk pinned">
                  <span className="cmd">circuits</span>
                  <span className="out">11 compiled · vk pinned</span>
                </p>
                <p className="term-line" data-cmd="prover" data-out="in-browser UltraHonk">
                  <span className="cmd">prover</span>
                  <span className="out">in-browser UltraHonk</span>
                </p>
                <p className="term-line" data-cmd="recovery" data-out="1 signature · full restore">
                  <span className="cmd">recovery</span>
                  <span className="out">1 signature · full restore</span>
                </p>
                <p className="term-cursor" id="termCursor">
                  $ <span className="blink">▌</span>
                </p>
              </div>
              <div className="term-foot">
                <span>OPEN SOURCE</span>
                <span className="grad-tick" />
                <span>REPRODUCIBLE · DETERMINISTIC</span>
              </div>
            </div>
          </div>
        </section>

        {/* spec sheet */}
        <section className="section" id="spec">
          <p className="kicker reveal">{"// SPEC SHEET"}</p>
          <h2 className="reveal">
            Private by construction.
            <br />
            Verifiable by anyone.
          </h2>
          <div className="grid3">
            <article className="card reveal">
              <span className="idx">01/</span>
              <span className="grad-tick" />
              <h3>Shielded positions</h3>
              <p>
                Deposits, debts, and collateral live as encrypted notes. Your
                counterparties see a valid market — never your book.
              </p>
              <dl className="kv">
                <div>
                  <dt>state</dt>
                  <dd>encrypted notes</dd>
                </div>
                <div>
                  <dt>visibility</dt>
                  <dd>owner-only</dd>
                </div>
                <div>
                  <dt>leakage</dt>
                  <dd>zero</dd>
                </div>
              </dl>
            </article>
            <article className="card reveal">
              <span className="idx">02/</span>
              <span className="grad-tick" />
              <h3>ZK-verified solvency</h3>
              <p>
                Every borrow carries an UltraHonk proof that the position is
                over-collateralized. The chain verifies math, not identities.
              </p>
              <dl className="kv">
                <div>
                  <dt>proof</dt>
                  <dd>UltraHonk</dd>
                </div>
                <div>
                  <dt>verified</dt>
                  <dd>on-chain</dd>
                </div>
                <div>
                  <dt>trust</dt>
                  <dd>none required</dd>
                </div>
              </dl>
            </article>
            <article className="card reveal">
              <span className="idx">03/</span>
              <span className="grad-tick" />
              <h3>Agent-native ERC-4337</h3>
              <p>
                Smart accounts and autonomous agents transact through account abstraction
                — session keys, sponsored gas, policy-bound strategies.
              </p>
              <dl className="kv">
                <div>
                  <dt>accounts</dt>
                  <dd>ERC-4337</dd>
                </div>
                <div>
                  <dt>execution</dt>
                  <dd>intent relayer</dd>
                </div>
                <div>
                  <dt>policies</dt>
                  <dd>user-signed</dd>
                </div>
              </dl>
            </article>
          </div>
        </section>

        {/* how it works */}
        <section className="section" id="how">
          <p className="kicker reveal">{"// HOW IT WORKS"}</p>
          <h2 className="reveal">Three steps. One signature.</h2>
          <div className="steps">
            <div className="step reveal">
              <span className="step-n">1</span>
              <h3>Sign once</h3>
              <p>
                One wallet signature derives your session keys. No accounts, no email, no
                KYC to see your own money.
              </p>
            </div>
            <div className="step-arrow reveal" aria-hidden="true">
              →
            </div>
            <div className="step reveal">
              <span className="step-n">2</span>
              <h3>Prove in your browser</h3>
              <p>
                Deposits and borrows are proven client-side. What leaves your machine is a
                proof — never a number.
              </p>
            </div>
            <div className="step-arrow reveal" aria-hidden="true">
              →
            </div>
            <div className="step reveal">
              <span className="step-n">3</span>
              <h3>The chain verifies</h3>
              <p>
                Contracts check the proof and update the shielded pool. Lose your device?
                One signature restores everything.
              </p>
            </div>
          </div>
        </section>

        {/* faq */}
        <section className="section" id="faq">
          <p className="kicker reveal">{"// FAQ"}</p>
          <h2 className="reveal">Fair questions.</h2>
          <div className="faqs reveal">
            <details>
              <summary>
                If positions are private, how do you stop bad debt?
                <span className="faq-x">+</span>
              </summary>
              <p>
                Per-user amounts are hidden, but protocol-level totals stay public and
                every operation carries a zero-knowledge proof that health-factor and
                liquidity rules hold. The market is auditable; individuals are not.
              </p>
            </details>
            <details>
              <summary>
                Is this live? What exists today?
                <span className="faq-x">+</span>
              </summary>
              <p>
                The full stack is built and test-covered: 11 contracts (224 passing tests,
                including solvency invariants), 11 zk circuits with pinned verification
                keys, in-browser proving, and signature-only recovery. A public testnet
                demo is the next milestone; mainnet follows a security audit — not before.
              </p>
            </details>
            <details>
              <summary>
                What about compliance?
                <span className="faq-x">+</span>
              </summary>
              <p>
                Privacy is not anonymity from everyone, always. The design supports
                optional auditor-decryption at deposit time, so users who need a
                compliance trail can have one — chosen, not imposed.
              </p>
            </details>
            <details>
              <summary>
                Who can see my balance?
                <span className="faq-x">+</span>
              </summary>
              <p>
                You. Your balance lives as encrypted notes only your keys can open. The
                protocol sees commitments; explorers see proofs; your counterparties see a
                solvent market.
              </p>
            </details>
          </div>
        </section>

        {/* waitlist */}
        <section className="section closing" id="waitlist">
          <p className="kicker reveal">{"// EARLY ACCESS"}</p>
          <h2 className="reveal">The quiet money market.</h2>
          <p className="status-line reveal">
            open source · 224/224 tests green · audits being scoped · testnet demo next
          </p>
          <div className="cta-row center reveal">
            <a className="btn btn-gradient" href={WAITLIST}>
              Join the waitlist
            </a>
            <a className="btn btn-outline" href={GITHUB} target="_blank" rel="noopener noreferrer">
              Star the repo
            </a>
          </div>
          <p className="tiny reveal">
            No forms, no trackers. The waitlist is an email — fitting, for a privacy
            protocol.
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>NoctFinance © 2026</span>
        <nav>
          <a href="#proof">proof</a>
          <a href="#spec">protocol</a>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer">
            github
          </a>
        </nav>
        <span className="foot-sig">signal / noise — proofs over promises</span>
      </footer>

      <Interactions />
    </>
  );
}
