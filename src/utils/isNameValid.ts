const blackedOutNames = [
  "anonymous",
  "home",
  "settings",
  "about",
  "privacy",
  "disclaimer",
  "answer",
  "answers",
  "questions",
  "question",
  "faq",
  "forgot-password",
  "reset-password",
  "login",
  "register",
  "admin",
  // "aigbiluese_eronmonsele"
];

const isNameValid = (name: string): boolean => {
  if (blackedOutNames.includes(name.toLowerCase())) {
    return false;
  }

  const reg = /^[a-z0-9_]+$/gi;

  if (!reg.test(name)) {
    return false;
  }

  return true;
};

export default isNameValid;
