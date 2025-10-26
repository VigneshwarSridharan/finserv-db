import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#e6f2ff" },
          100: { value: "#bae0ff" },
          200: { value: "#7cc4fa" },
          300: { value: "#47a3f3" },
          400: { value: "#2186eb" },
          500: { value: "#0967d2" },
          600: { value: "#0552b5" },
          700: { value: "#03449e" },
          800: { value: "#01337d" },
          900: { value: "#002159" },
        },
      },
      fonts: {
        body: { value: "system-ui, sans-serif" },
        heading: { value: "system-ui, sans-serif" },
      },
    },
    semanticTokens: {
      colors: {
        "bg.canvas": {
          value: {
            base: "{colors.gray.50}",
            _dark: "{colors.gray.900}",
          },
        },
        "bg.surface": {
          value: {
            base: "white",
            _dark: "{colors.gray.800}",
          },
        },
        "bg.muted": {
          value: {
            base: "{colors.gray.100}",
            _dark: "{colors.gray.700}",
          },
        },
        "bg.active": {
          value: {
            base: "{colors.brand.50}",
            _dark: "{colors.brand.900}",
          },
        },
        "bg.hover": {
          value: {
            base: "{colors.gray.100}",
            _dark: "{colors.gray.700}",
          },
        },
        "text.primary": {
          value: {
            base: "{colors.gray.900}",
            _dark: "{colors.gray.100}",
          },
        },
        "text.secondary": {
          value: {
            base: "{colors.gray.600}",
            _dark: "{colors.gray.400}",
          },
        },
        "text.active": {
          value: {
            base: "{colors.brand.600}",
            _dark: "{colors.brand.300}",
          },
        },
        "border.default": {
          value: {
            base: "{colors.gray.200}",
            _dark: "{colors.gray.700}",
          },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)

export default system


