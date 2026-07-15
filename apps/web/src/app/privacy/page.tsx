export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-10 text-sm leading-relaxed text-[#2c3328]">
      <h1 className="font-serif text-2xl">隐私说明</h1>
      <p className="mt-4 text-[#5c6b52]">Fangrush（三狼连猎）一期说明（无账号）。</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[#5c6b52]">
        <li>关卡进度、碎片、皮肤与任务进度保存在你的浏览器本地（localStorage）。</li>
        <li>清除浏览器数据会导致进度丢失；一期不提供云同步。</li>
        <li>观看广告时，适用广告服务商自身的隐私政策与技术 Cookie/标识。</li>
        <li>独立站可由托管商（如 Vercel）记录常规访问日志（如 IP、时间）。</li>
        <li>门户版本默认不额外接入自建远程遥测。</li>
        <li>本产品不主动收集邮箱、手机号或实名信息。</li>
      </ul>
      <p className="mt-6 text-xs text-[#7a8574]">
        网站：fangrush.com · 联系请通过站内设置页或发行渠道提供的开发者邮箱。
      </p>
    </main>
  )
}
