import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        AtkinsonHyperlegibleNext:['Atkinson Hyperlegible Next', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
