// The LCOM / KeyBlitz case study — FC-DOSSIER 04. The one argument here is the
// REGISTER: the same person who ships Prisma+React platforms also went down to
// the metal — wrote an interrupt-driven device driver and drew a game frame by
// frame in C on MINIX 3, with no graphics library. Breadth, not project
// dominance. Every hard number is checked against the repo by verify-claims.
//
// The honest frame, held everywhere below:
//   - This is a four-person team project; I was one of four (2nd by commits).
//     My slice is stated precisely: the RTC driver and the game's interface
//     layer (menu, on-screen UI, text rendering). My three teammates wrote the
//     keyboard, mouse, timer and video drivers — credited as "a team of four",
//     no names (naming needs their consent, which this page doesn't have).
//   - The grade (16.5/20) stays OFF the page. The corroboration is the working
//     game and the checkable code — not a flattering number. The thesis is
//     breadth, not excellence, so it doesn't need one. Said plainly in §05:
//     this case study's outside corroboration is weaker than the other three,
//     and it earns its place on distinctiveness, not on a grade.

export const caseMeta = {
  title: "KeyBlitz",
  docId: "FC-DOSSIER 04",
  course: "LCOM (Laboratório de Computadores) · FEUP, LEIC 2025/26",
  team: "Group 2LEIC6_1 · a team of four",
  role: "The RTC driver + the game's interface layer — one of four",
  period: "Feb — Jun 2026",
  status: "Delivered",
  stack: "C · MINIX 3 · VBE framebuffer · i8042 / PS-2 · interrupts",
} as const;

export const abstract = {
  claim:
    "The same person who ships Prisma-and-React platforms also wrote a device driver and drew a game one pixel at a time, in C, on a microkernel with no graphics library underneath it.",
  body: "KeyBlitz is a typing-speed game for MINIX 3: words ride falling asteroids toward Earth and you type them to shoot them down, with lives, a live words-per-minute and accuracy read-out, and high scores stamped with the real-time clock. Four of us built it for FEUP's Computer Laboratory course from raw device drivers up — no engine, no framework, every frame written to the VBE linear framebuffer by hand. My part was the RTC driver and the game's whole interface layer; my three teammates wrote the keyboard, mouse, timer and video drivers.",
  metrics: [
    { value: "5", label: "devices driven", footnote: "timer, keyboard, mouse, video (VBE), RTC · four on interrupt lines" },
    { value: "0", label: "graphics libraries", footnote: "every frame drawn to the raw VBE framebuffer; text from a bitmap font, glyph by glyph" },
    { value: "4.8k", label: "lines of C", footnote: "project/src, the whole game · wc -l" },
    { value: "Delivered", label: "handed in, it runs", footnote: "MINIX 3 · demoed and graded, June 2026" },
  ],
} as const;

export const problem = {
  paragraphs: [
    "Everything else in this dossier runs on top of a mountain of other people's code — a database engine, a rendering framework, a garbage collector, an operating system that hands you files and sockets and threads. That abstraction is the job most of the time, and it is the right tool. It also lets you go a long way without ever finding out whether you understand the machine underneath it.",
    "LCOM is the course that takes the mountain away. You write in C on MINIX 3, a microkernel where talking to hardware means subscribing to an interrupt line, reading a device's registers by their hex addresses, and being handed nothing but a flat framebuffer to draw into. There is no library that draws a rectangle for you, no event loop you didn't write, no clock you didn't read out of the chip yourself. The point of building a whole game in that setting is that it can't be faked: either the interrupts are wired correctly and the thing runs at sixty frames a second, or it doesn't.",
  ],
} as const;

export const constraints = [
  {
    k: "Interrupts, not polling",
    v: "Every device — timer, keyboard, mouse, real-time clock — is read through its hardware interrupt, not by burning CPU asking 'is there data yet?'. The process blocks in the kernel until hardware wakes it. Getting that wrong doesn't slow the game down; it hangs it.",
  },
  {
    k: "No graphics library",
    v: "The only thing the video hardware gives you is a pointer to a linear framebuffer — one byte per colour channel per pixel. Every asteroid, every letter, every menu box is bytes written into that buffer. Text is a bitmap font drawn one glyph at a time; there is no drawString.",
  },
  {
    k: "One shared C codebase, four people",
    v: "Four students sharing one MINIX project with no module system to hide behind — the device drivers, the game state and the interface all link into a single binary. The interfaces between them had to be agreed and held to, in a language with no guardrails.",
  },
  {
    k: "It has to survive a live defence",
    v: "LCOM is graded partly by opening the source in front of the examiner and being asked to read and justify any function on the spot. Code you don't understand is code you can't defend — so the parts you own, you own completely.",
  },
] as const;

// ─── fig. 1 — the interrupt dispatch (the team's architecture) ──────────────
// The main loop in main.c: four devices subscribe to interrupt lines, and one
// blocking driver_receive fans every hardware notification out to the right
// handler. This is the whole team's architecture, not my slice — attributed so.

export const dispatch = {
  sources: [
    { irq: "IRQ 0", dev: "Timer", ih: "timer_ih", note: "the 60 Hz frame tick — advances the game and redraws", mine: false },
    { irq: "IRQ 1", dev: "Keyboard", ih: "kbc_ih", note: "every keystroke, through the i8042 controller", mine: false },
    { irq: "IRQ 12", dev: "Mouse", ih: "mouse_ih", note: "PS-2 packets for the menus", mine: false },
    { irq: "IRQ 8", dev: "RTC", ih: "rtc_ih", note: "the real-time clock, for score timestamps", mine: true },
  ],
  caption:
    "fig. 1 — one blocking driver_receive fans four interrupt lines out to their handlers · main.c · the team's architecture",
} as const;

// ─── fig. 2 — the RTC driver read path (mine) ──────────────────────────────
// rtc.c, 63% mine. The honest deep artifact: reading the wall clock out of the
// chip correctly, which is fiddlier than it looks — the clock stores digits in
// BCD and must not be read mid-update.

export const rtcPath = {
  steps: [
    { k: "subscribe", v: "rtc_subscribe_int enables the update-ended interrupt (bit 4 of register B) and hooks IRQ 8." },
    { k: "wait for update-ended", v: "The chip updates once a second; reading mid-update returns garbage. The handler waits for the update-ended flag rather than racing it." },
    { k: "read the registers", v: "Seconds, minutes, hours, day, month, year — each read from its own register address on the CMOS bus." },
    { k: "BCD → binary", v: "The clock stores each field in binary-coded decimal — 0x59 means 59, not 89. Every field is converted: (bcd & 0x0f) + (bcd >> 4) * 10." },
    { k: "stamp the score", v: "The decoded date and time are written next to a new high score, so the board reads '14 Jun · 21:30' — a real timestamp, from the real chip." },
  ],
  caption: "fig. 2 — reading the wall clock out of the CMOS chip, done properly · devices/rtc.c, mine",
} as const;

// ─── fig. 0 — the KeyBlitz screen, engraved ────────────────────────────────
// A drawn reconstruction of the running game, in the site's ink+amber register
// (the game's own palette was amber #E0A030 on dark blue — near-native here).
// The words are the real word list; the danger line is the real y=420 line.

export const screen = {
  hud: { scoreLabel: "SCORE", score: "0", lives: 2 },
  // Words falling on asteroids, laid out roughly as the real gameplay frame.
  asteroids: [
    { word: "HEAT", x: 44, y: 12 },
    { word: "CAUGHT", x: 60, y: 26 },
    { word: "BLOW", x: 88, y: 34 },
    { word: "SAT", x: 13, y: 42 },
    { word: "REST", x: 25, y: 52 },
    { word: "SKY", x: 88, y: 62 },
  ],
  keyboardRows: ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"],
  caption:
    "fig. 0 — KeyBlitz on MINIX 3, redrawn: the HUD, the word-asteroids, the danger line at y=420, the on-screen keyboard · my interface layer",
} as const;

export const myPart = {
  paragraphs: [
    "Two things on this screen are mine. The first you can't see: the RTC driver, the code in fig. 2 that reads the wall clock out of the CMOS chip so a high score can carry a real date and time. It is a small driver, but it is a whole one — subscribe, interrupt, read, decode, done — and it is the piece of this project that is unambiguously low-level systems work.",
    "The second is everything you can see. The game has no graphics library, so the menu, the on-screen keyboard, the score and lives read-out, and the text rendering — every glyph drawn from a bitmap font, one at a time, into the framebuffer — is the interface layer I wrote. The asteroids and the falling words are the shared game state my teammates and I built together; the surface they're drawn onto is mine.",
    "What I did not write, and won't claim: the keyboard, mouse, timer and video drivers. Those were my three teammates' work, and the game is theirs as much as mine.",
  ],
} as const;

export const outcome = {
  paragraphs: [
    "KeyBlitz was delivered, demoed on MINIX 3, and graded. It runs — the honest corroboration for this page is exactly that, the working game and the code you could open and read, not an outside authority. That makes it the weakest-corroborated of the four case studies here: there is no council minute, no production database, no examiner's rubric quoted, because the claim doesn't need one. The claim is only that I can work at this level, and a running game built from raw drivers is its own proof.",
    "That is the whole reason it's in the dossier. The other three case studies all live at the top of the stack — TypeScript, Prisma, Firebase, React. This one is the counterweight: a device driver and a framebuffer and a microkernel, in C, with nothing underneath. Breadth is the argument, and you can only make it by showing both ends.",
  ],
} as const;
