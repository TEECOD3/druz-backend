const restrictedNames = [
	"anonymous",
	"settings",
	"setting",
	"response",
	"responses",
	"about",
	"privacy",
	"disclaimer",
	"answer",
	"answers",
	"questions",
	"question",
	"message",
	"messages",
	"faq",
	"forgot-password",
	"reset-password",
	"login",
	"register",
	"admin",
	"username",
	"home",
	"index",
	"blog",
	"blogs",
	"contact",
	"contacts",
	"faqs",
	"privacy-policy",
	"terms-of-use",
	"chucknorris",
];

const isNameValid = (name: string): boolean => {
  if (restrictedNames.includes(name.toLowerCase())) {
    return false;
  }

  const reg = /^[a-z0-9_]+$/gi;

  if (!reg.test(name)) {
    return false;
  }

  return true;
};

export default isNameValid;
