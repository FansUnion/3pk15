import Script from 'next/script'

/** Fangrush GA4 measurement ID（写死；不走 env） */
const GA_ID = 'G-K1K4W9WFCQ'

export function Ga4() {
  // 门户瘦包不加载 GA，避免污染独立站数据
  if ((process.env.NEXT_PUBLIC_APP_SHELL ?? 'standalone') === 'portal') {
    return null
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}
