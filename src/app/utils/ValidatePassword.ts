export type PasswordRule = {
  test: RegExp;
  message: string;
};

export const passwordRules: PasswordRule[] = [
  { test: /.{6,}/, message: "Password must be at least 6 characters long" },
  { test: /[A-Z]/, message: "Password must include at least one uppercase letter" },
  { test: /\d/, message: "Password must include at least one number" },
  { test: /[!@#$%^&*]/, message: "Password must include at least one special character" },
];

// Pure validation function, returns first failing rule or null if valid
export const ValidatePassword = (password: string): string | null => {
  if (!password) return "Password is required";

  const failedRule = passwordRules.find((rule) => !rule.test.test(password));
  return failedRule ? failedRule.message : null;
};
