import chalk from "chalk";
import app from "./app";
const magentaUnderline = chalk.magenta.underline;
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(magentaUnderline(`App up and running on port ${PORT}`));
});
