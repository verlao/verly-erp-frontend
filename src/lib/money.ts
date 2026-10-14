// Money helpers in integer cents. Rounding is HALF_UP (ties away from zero),
// matching the backend's DoubleRounder.round(x, 2) in ProductCalculationService.
// Inputs are read from their decimal string form so float noise never leaks in.

interface Decimal {
  negative: boolean;
  digits: bigint; // unscaled magnitude
  scale: number; // number of fractional digits
}

function parseDecimal(value: number | string): Decimal {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new RangeError(`Invalid money value: ${value}`);
  }
  const text = String(value).trim();
  const match = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(text);
  if (!match || (!match[2] && !match[3])) {
    throw new RangeError(`Invalid money value: ${text}`);
  }
  const [, sign, intPart, fracPart = "", exp = "0"] = match;
  let digits = (intPart + fracPart).replace(/^0+(?=\d)/, "") || "0";
  let scale = fracPart.length - Number(exp);
  if (scale < 0) {
    digits += "0".repeat(-scale);
    scale = 0;
  }
  return { negative: sign === "-", digits: BigInt(digits), scale };
}

// Divide magnitude by 10^scale rounding half away from zero, apply sign.
function roundToUnits(d: Decimal, scale: number): number {
  const divisor = 10n ** BigInt(scale);
  let q = d.digits / divisor;
  if ((d.digits % divisor) * 2n >= divisor) q += 1n;
  const result = Number(q);
  return d.negative && result !== 0 ? -result : result;
}

/** Decimal reais (12.34 or "12.345") to integer cents, HALF_UP. */
export function toCents(value: number | string): number {
  const d = parseDecimal(value);
  if (d.scale < 2)
    return roundToUnits(
      { ...d, digits: d.digits * 10n ** BigInt(2 - d.scale), scale: 2 },
      0,
    );
  return roundToUnits(d, d.scale - 2);
}

/** cents x factor (e.g. a margin of 1.30), exact decimal arithmetic, HALF_UP. */
export function multiplyCents(cents: number, factor: number | string): number {
  if (!Number.isInteger(cents))
    throw new RangeError(`cents must be an integer: ${cents}`);
  const f = parseDecimal(factor);
  const negative = f.negative !== cents < 0;
  return roundToUnits(
    { negative, digits: BigInt(Math.abs(cents)) * f.digits, scale: f.scale },
    f.scale,
  );
}

export function sumCents(...values: number[]): number;
export function sumCents(values: readonly number[]): number;
export function sumCents(...args: (number | readonly number[])[]): number {
  return args.flat().reduce<number>((acc, v) => acc + v, 0);
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(cents: number): string {
  return brl.format(cents / 100);
}

/** "1.113,26" or "R$ 1.113,26" to integer cents. Returns null when unparseable. */
export function parseBRL(text: string): number | null {
  const cleaned = text.replace(/R\$|\s| /g, "");
  if (!/^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$/.test(cleaned)) return null;
  return toCents(cleaned.replace(/\./g, "").replace(",", "."));
}
