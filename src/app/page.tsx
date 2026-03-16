import Link from "next/link";

/* ────────────────────────────────────────────
   Section: Hero
   ──────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-28 text-center md:py-40">
        <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300">
          판매 회차 중심 운영도구
        </span>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          팔 때만 열리는
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            나만의 마켓
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-300 md:text-xl">
          상설몰이 아닙니다. 라이브 할 때 열고, 끝나면 닫는
          <br className="hidden md:block" /> 판매 회차 중심 운영도구.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-xl bg-blue-500 px-8 py-3.5 text-base font-semibold shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold backdrop-blur transition hover:bg-white/10"
          >
            로그인
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Section: Pain Points
   ──────────────────────────────────────────── */
const painPoints = [
  {
    icon: "😵‍💫",
    title: "주문을 DM으로 받고 계신가요?",
    desc: "스마트스토어 없이 인스타 DM, 카톡으로 주문받으면 빠지는 건 당연합니다.",
  },
  {
    icon: "📦",
    title: "재고 파악이 안 되시나요?",
    desc: "수기로 관리하다 보면 이중판매, 재고 오류가 반복됩니다.",
  },
  {
    icon: "🔄",
    title: "매번 새로 세팅하시나요?",
    desc: "라이브마다 상품 등록, 링크 공유, 주문 정리를 처음부터 반복하고 계신가요?",
  },
];

function PainPoints() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
          이런 고민, 있으시죠?
        </h2>
        <p className="mb-12 text-center text-gray-500">
          소규모 셀러가 매일 겪는 현실적인 문제들
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {painPoints.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-md"
            >
              <span className="text-4xl">{p.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Section: Comparison Table (상설몰 vs 원타임 마켓)
   ──────────────────────────────────────────── */
const comparisonRows = [
  { label: "운영 방식", them: "365일 상시 오픈", us: "판매 회차별 열기/닫기" },
  { label: "주문 수집", them: "항상 열린 장바구니", us: "회차 단위 마감 관리" },
  { label: "재고 관리", them: "상시 재고 추적", us: "회차별 한정 수량 세팅" },
  { label: "링크 공유", them: "고정 URL", us: "회차마다 고유 링크 + QR" },
  { label: "정산", them: "월 단위 자동 정산", us: "회차별 정산 리포트" },
  {
    label: "적합 대상",
    them: "꾸준히 파는 브랜드",
    us: "라이브·공구·팝업 셀러",
  },
];

function ComparisonTable() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
          상설몰 vs 원타임 마켓
        </h2>
        <p className="mb-12 text-center text-gray-500">
          상설몰과는 목적이 다릅니다
        </p>
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          {/* header */}
          <div className="grid grid-cols-3 bg-gray-100 text-sm font-semibold text-gray-600">
            <div className="p-4" />
            <div className="p-4 text-center">상설몰</div>
            <div className="p-4 text-center text-blue-600">원타임 마켓</div>
          </div>
          {/* rows */}
          {comparisonRows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
            >
              <div className="p-4 font-medium text-gray-700">{row.label}</div>
              <div className="p-4 text-center text-gray-500">{row.them}</div>
              <div className="p-4 text-center font-medium text-blue-600">
                {row.us}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Section: How It Works
   ──────────────────────────────────────────── */
const steps = [
  { num: "01", title: "회원가입", desc: "이메일 하나로 30초 가입" },
  { num: "02", title: "상품 등록", desc: "이름, 가격, 수량만 입력하면 끝" },
  { num: "03", title: "회차 오픈", desc: "판매 회차를 만들고 링크 공유" },
  {
    num: "04",
    title: "주문 접수",
    desc: "고객이 링크로 접속해 바로 주문",
  },
  { num: "05", title: "마감 & 정산", desc: "회차 닫고 주문·배송·정산 한번에" },
];

function HowItWorks() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
          이렇게 사용하세요
        </h2>
        <p className="mb-12 text-center text-gray-500">5단계로 끝나는 판매</p>
        <div className="grid gap-6 md:grid-cols-5">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white">
                {s.num}
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Section: Features
   ──────────────────────────────────────────── */
const features = [
  {
    icon: "🔗",
    title: "회차별 고유 링크",
    desc: "판매 회차마다 고유 URL이 생성되어 SNS·카톡에 바로 공유할 수 있습니다.",
  },
  {
    icon: "📊",
    title: "실시간 재고 관리",
    desc: "주문이 들어오면 자동으로 재고가 차감되고, 품절 시 자동 마감됩니다.",
  },
  {
    icon: "📱",
    title: "QR 코드 자동 생성",
    desc: "오프라인 팝업, 라이브 방송에서 QR로 바로 주문 페이지에 접근 가능합니다.",
  },
  {
    icon: "🚚",
    title: "배송 상태 추적",
    desc: "운송장 입력부터 배송 완료까지 한눈에 관리할 수 있습니다.",
  },
  {
    icon: "💰",
    title: "회차별 정산 리포트",
    desc: "회차 단위로 매출, 주문 수, 취소율을 자동으로 정리해 드립니다.",
  },
  {
    icon: "🔔",
    title: "알림톡 연동",
    desc: "주문 확인, 배송 시작, 배송 완료 알림을 카카오 알림톡으로 자동 발송합니다.",
  },
];

function Features() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
          주요 기능
        </h2>
        <p className="mb-12 text-center text-gray-500">
          소규모 셀러를 위해 딱 필요한 것만
        </p>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-gray-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Section: Trust Layer
   ──────────────────────────────────────────── */
const trustItems = [
  { stat: "30초", label: "가입 소요 시간" },
  { stat: "무료", label: "기본 요금제" },
  { stat: "0%", label: "판매 수수료" },
  { stat: "24시간", label: "고객지원 응답" },
];

function TrustLayer() {
  return (
    <section className="bg-blue-600 py-16 text-white">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold">
          신뢰할 수 있는 이유
        </h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {trustItems.map((t) => (
            <div key={t.label} className="text-center">
              <div className="text-4xl font-extrabold">{t.stat}</div>
              <div className="mt-2 text-sm text-blue-100">{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Section: Pricing
   ──────────────────────────────────────────── */
const plans = [
  {
    name: "무료",
    price: "₩0",
    period: "영구 무료",
    desc: "시작하는 셀러를 위한 기본 기능",
    features: [
      "월 3회 판매 회차",
      "회차당 상품 10개",
      "기본 주문 관리",
      "QR 코드 생성",
    ],
    cta: "무료로 시작",
    highlight: false,
  },
  {
    name: "베이직",
    price: "₩29,900",
    period: "/월",
    desc: "본격적으로 판매하는 셀러",
    features: [
      "무제한 판매 회차",
      "회차당 상품 50개",
      "배송 관리 + 운송장",
      "회차별 정산 리포트",
      "알림톡 발송 (월 500건)",
    ],
    cta: "베이직 시작",
    highlight: true,
  },
  {
    name: "프로",
    price: "₩59,900",
    period: "/월",
    desc: "대량 판매 · 다채널 운영 셀러",
    features: [
      "베이직 전체 포함",
      "무제한 상품 등록",
      "알림톡 무제한 발송",
      "커스텀 도메인 연결",
      "우선 고객지원",
      "API 연동",
    ],
    cta: "프로 시작",
    highlight: false,
  },
];

function Pricing() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
          요금제
        </h2>
        <p className="mb-12 text-center text-gray-500">
          판매 수수료 0%. 필요한 만큼만 결제하세요.
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 ${
                plan.highlight
                  ? "border-2 border-blue-500 bg-white shadow-lg shadow-blue-100"
                  : "border border-gray-200 bg-white"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold text-white">
                  인기
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-gray-900">
                  {plan.price}
                </span>
                <span className="mb-1 text-sm text-gray-400">
                  {plan.period}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">{plan.desc}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-blue-500 text-white shadow-md shadow-blue-200 hover:bg-blue-400"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Section: Final CTA
   ──────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 py-20 text-center text-white">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-bold md:text-4xl">
          지금 바로 시작하세요
        </h2>
        <p className="mt-4 text-gray-300">
          가입 30초, 카드 등록 없이 무료로 시작할 수 있습니다.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="rounded-xl bg-blue-500 px-8 py-3.5 text-base font-semibold shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold backdrop-blur transition hover:bg-white/10"
          >
            로그인
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Section: Footer
   ──────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 text-center text-sm text-gray-400">
        <span className="font-semibold text-gray-700">원타임 마켓</span>
        <p>팔 때만 열리는 나만의 마켓</p>
        <div className="flex gap-6">
          <Link href="#" className="transition hover:text-gray-600">
            이용약관
          </Link>
          <Link href="#" className="transition hover:text-gray-600">
            개인정보처리방침
          </Link>
          <Link href="#" className="transition hover:text-gray-600">
            문의하기
          </Link>
        </div>
        <p className="text-xs text-gray-300">
          &copy; {new Date().getFullYear()} 원타임 마켓. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────
   Page
   ──────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <Hero />
      <PainPoints />
      <ComparisonTable />
      <HowItWorks />
      <Features />
      <TrustLayer />
      <Pricing />
      <FinalCTA />
      <Footer />
    </>
  );
}
