export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");

  if (digits.length !== 11) return false;
  if (digits === digits[0].repeat(11)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(digits[i]) * (10 - i);
  let dig1 = (soma * 10) % 11;
  if (dig1 === 10) dig1 = 0;
  if (parseInt(digits[9]) !== dig1) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(digits[i]) * (11 - i);
  let dig2 = (soma * 10) % 11;
  if (dig2 === 10) dig2 = 0;
  if (parseInt(digits[10]) !== dig2) return false;

  return true;
}
