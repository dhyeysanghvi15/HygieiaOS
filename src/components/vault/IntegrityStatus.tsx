export function IntegrityStatus({
  result,
}: {
  result: { ok: true } | { ok: false; atSeq: number; reason: string }
}) {
  if (result.ok) {
    return (
      <div className="rounded-2xl border border-accent-3/30 bg-accent-3/10 p-3 text-sm text-white/80">
        Integrity check OK. Ledger chain is intact.
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-accent-danger/30 bg-accent-danger/10 p-3 text-sm text-white/85">
      Tampering detected at entry #{result.atSeq}: {result.reason}
    </div>
  )
}

