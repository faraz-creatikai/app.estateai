import { countryCodes } from "./countryCodes";

export const trimCountryCodeHelper = (num: string) => {
  if (!num) return "";


  let trimmedNum = num;

  for (const code of countryCodes) {
    if (trimmedNum.startsWith(code)) {
      trimmedNum = trimmedNum.slice(code.length);
      break; // stop after first match
    }
  }

  return trimmedNum;
};
