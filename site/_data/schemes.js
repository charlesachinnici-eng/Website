// The approved colour schemes and fonts editors can choose from in the editor (Site settings -> Theme).
// Text colours are not listed: the build picks light or dark text automatically,
// whichever is more readable on each background.
// To add a scheme: add an entry here AND add its key to the "scheme" list in .pages.yml.
export default {
  schemes: {
    classic: {
      label: "Classic Walnut",
      header: "#260801",       // header and footer bars
      button: "#D9A171",       // buttons
      buttonHover: "#A6653F",  // buttons when the mouse is over them
      panel: "#F2F2F2",        // boxes holding text, the calendar and the game viewer
      accent: "#D9A171",       // borders and highlights
      strong: "#8A4F2E",       // headings and links inside boxes
      boardLight: "#CCB89A",
      boardDark: "#9A7454",
    },
    tournament: {
      label: "Tournament Green",
      header: "#1E3A2B",
      button: "#5E8C61",
      buttonHover: "#3B6B45",
      panel: "#F4F6F1",
      accent: "#5E8C61",
      strong: "#2F6B3F",
      boardLight: "#EEEED2",
      boardDark: "#769656",
    },
    midnight: {
      label: "Midnight Blue",
      header: "#14213D",
      button: "#4A6FA5",
      buttonHover: "#2C4A75",
      panel: "#F2F4F8",
      accent: "#4A6FA5",
      strong: "#2C4A75",
      boardLight: "#DEE3E6",
      boardDark: "#8CA2AD",
    },
    burgundy: {
      label: "Burgundy & Gold",
      header: "#4A0E1C",
      button: "#C9A227",
      buttonHover: "#7A1F2E",
      panel: "#FAF6EE",
      accent: "#C9A227",
      strong: "#7A1F2E",
      boardLight: "#F0D9B5",
      boardDark: "#B58863",
    },
    slate: {
      label: "Slate Gray",
      header: "#25282D",
      button: "#6B7480",
      buttonHover: "#454C55",
      panel: "#F3F4F5",
      accent: "#6B7480",
      strong: "#454C55",
      boardLight: "#E3E5E8",
      boardDark: "#9AA1AA",
    },
  },
  fonts: {
    georgia: { label: "Georgia (classic serif)", stack: "Georgia, 'Times New Roman', serif" },
    palatino: { label: "Palatino (elegant serif)", stack: "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif" },
    trebuchet: { label: "Trebuchet (friendly sans-serif)", stack: "'Trebuchet MS', 'Segoe UI', Arial, sans-serif" },
    verdana: { label: "Verdana (very readable sans-serif)", stack: "Verdana, Tahoma, 'Segoe UI', sans-serif" },
  },
};
