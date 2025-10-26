import { IconButton } from "@chakra-ui/react";
import { useThemeStore } from "../../store/themeStore";
import { LuMoon, LuSun } from "react-icons/lu";

export function useColorMode() {
  const { colorMode, setColorMode, toggleColorMode } = useThemeStore();
  return {
    colorMode,
    setColorMode,
    toggleColorMode,
  };
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === "light" ? light : dark;
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  return colorMode === "light" ? <LuSun /> : <LuMoon />;
}

export const ColorModeButton = () => {
  const { toggleColorMode } = useColorMode();
  return (
    <IconButton
      onClick={toggleColorMode}
      variant="ghost"
      aria-label="Toggle color mode"
      size="sm"
    >
      <ColorModeIcon />
    </IconButton>
  );
};

