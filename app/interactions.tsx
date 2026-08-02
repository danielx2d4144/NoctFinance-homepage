"use client";

import { useEffect } from "react";

/**
 * All animation is a client-side enhancement layered over server-rendered
 * markup: the page is complete and readable with JS disabled (SSR/SEO),
 * and every effect respects prefers-reduced-motion.
 */
export function Interactions() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];

    /* sticky nav blur */
    const nav = document.getElementById("nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    /* cursor spotlight over hero */
    const hero = document.getElementById("hero");
    const spot = document.getElementById("spot");
    if (hero && spot && !reduced) {
      const onMove = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        spot.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
        spot.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
      };
      hero.addEventListener("pointermove", onMove);
      cleanups.push(() => hero.removeEventListener("pointermove", onMove));
    }

    /* scroll reveals (staggered) */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target as HTMLElement;
          const parent = el.parentElement;
          const siblings = parent
            ? Array.from(parent.querySelectorAll(":scope > .reveal, :scope > * > .reveal"))
            : [];
          const i = Math.max(0, siblings.indexOf(el));
          el.style.transitionDelay = Math.min(i * 90, 450) + "ms";
          el.classList.add("in");
          io.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    /* cipher decrypt on the hero keyword */
    const GLYPHS = "!<>-_\\/[]{}—=+*^?#01zk";
    function decrypt(el: HTMLElement, done?: () => void) {
      const target = el.getAttribute("data-text") ?? "";
      let frame = 0;
      const queue = Array.from(target).map((ch) => ({
        ch,
        start: Math.floor(Math.random() * 22),
        end: Math.floor(Math.random() * 22) + 18,
      }));
      let raf = 0;
      const step = () => {
        let out = "";
        let complete = 0;
        for (const q of queue) {
          if (frame >= q.end) {
            complete++;
            out += q.ch;
          } else if (frame >= q.start) {
            out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          } else {
            out += " ";
          }
        }
        el.textContent = out;
        if (complete === queue.length) {
          done?.();
          return;
        }
        frame++;
        raf = requestAnimationFrame(step);
      };
      step();
      cleanups.push(() => cancelAnimationFrame(raf));
    }
    const dec = document.getElementById("decrypt");
    const underline = document.getElementById("underline");
    if (dec && underline) {
      if (reduced) {
        underline.classList.add("on");
      } else {
        const t = setTimeout(() => decrypt(dec, () => underline.classList.add("on")), 350);
        cleanups.push(() => clearTimeout(t));
      }
    }

    /* count-up stats */
    function countUp(el: HTMLElement) {
      const target = parseInt(el.getAttribute("data-target") ?? "0", 10);
      const suffix = el.getAttribute("data-suffix") ?? "";
      if (reduced || target === 0) {
        el.textContent = target + suffix;
        return;
      }
      let t0: number | null = null;
      const dur = 1400;
      const tick = (ts: number) => {
        if (t0 === null) t0 = ts;
        const p = Math.min((ts - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    const statsIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.querySelectorAll<HTMLElement>(".count").forEach(countUp);
          statsIo.unobserve(en.target);
        });
      },
      { threshold: 0.4 },
    );
    const stats = document.getElementById("stats");
    if (stats) statsIo.observe(stats);
    cleanups.push(() => statsIo.disconnect());

    /* terminal typewriter */
    function typeLine(line: HTMLElement, cb?: () => void) {
      const cmd = line.getAttribute("data-cmd") ?? "";
      const out = line.getAttribute("data-out") ?? "";
      line.textContent = "";
      const cmdSpan = document.createElement("span");
      cmdSpan.className = "cmd";
      const outSpan = document.createElement("span");
      outSpan.className = "out";
      line.appendChild(cmdSpan);
      line.appendChild(outSpan);
      if (reduced) {
        cmdSpan.textContent = cmd;
        outSpan.innerHTML = out;
        cb?.();
        return;
      }
      let i = 0;
      const typeCmd = () => {
        if (i <= cmd.length) {
          cmdSpan.textContent = cmd.slice(0, i);
          i++;
          const t = setTimeout(typeCmd, 34);
          cleanups.push(() => clearTimeout(t));
        } else {
          const t = setTimeout(() => {
            outSpan.innerHTML = out;
            cb?.();
          }, 220);
          cleanups.push(() => clearTimeout(t));
        }
      };
      typeCmd();
    }
    const termIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          termIo.unobserve(en.target);
          const lines = Array.from(en.target.querySelectorAll<HTMLElement>(".term-line"));
          const next = (k: number) => {
            if (k >= lines.length) return;
            typeLine(lines[k], () => {
              const t = setTimeout(() => next(k + 1), 160);
              cleanups.push(() => clearTimeout(t));
            });
          };
          next(0);
        });
      },
      { threshold: 0.35 },
    );
    const term = document.getElementById("terminal");
    if (term) termIo.observe(term);
    cleanups.push(() => termIo.disconnect());

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
