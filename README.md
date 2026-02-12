# PDF Banner Generator

Professional PVC banner generator that creates PDF files with precise CMYK colors, custom fonts, and standardized layout optimized for commercial printing.

## Features

- **Professional CMYK Color Support** - Industry-standard color space for commercial printing
- **Custom Font Support** - DejaVu Sans Condensed Bold with Unicode symbol support and fallback options
- **Standardized PVC Banner Layout** - Fixed 25mm margins, 0.5mm borders, and corner circles
- **Automatic Circle Placement** - Smart distribution of mounting circles with 500mm minimum spacing
- **Multi-line Text Support** - Precise vertical centering algorithm for text blocks
- **Extended Color Palette** - 13 predefined CMYK colors for professional printing
- **Flexible Dimensions** - Support for custom banner sizes in millimeters

## Installation

### Prerequisites

- [Deno](https://deno.land/) runtime (v1.37 or higher)

### Setup

1. Clone or download the project files
2. Ensure the `DejaVuSansCondensed-Bold.ttf` font file is in the project directory
3. The application will automatically use system fallback fonts if the custom font is unavailable

## Usage

### Command Line Interface

```bash
# Basic usage with default settings (1000x700mm yellow banner with black text)
deno run --allow-all main.ts --text "Your Banner Text"

# Custom banner with specific dimensions and colors
deno run --allow-all main.ts \
  --text "SALE 50% OFF" \
  --width 3000 \
  --height 1000 \
  --font-size 40 \
  --fg red \
  --bg white \
  --output "sale_banner.pdf"

# Multi-line text example
deno run --allow-all main.ts \
  --text $'GRAND OPENING\nJanuary 15th\n10% Discount' \
  --font-size 30 \
  --fg navy \
  --bg yellow
```

### Available Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--text` | `-t` | string | "Banner PVC" | Text to display on the banner |
| `--output` | `-o` | string | "banner.pdf" | Output PDF filename |
| `--width` | `-w` | number | 1000 | Banner width in millimeters |
| `--height` | `-e` | number | 700 | Banner height in millimeters |
| `--font-size` | `-f` | number | 25 | Font size in millimeters |
| `--fg` | | string | "black" | Foreground color (text, border, circles) |
| `--bg` | | string | "yellow" | Background color |
| `--center` | `-c` | boolean | true | Center text on the banner |

### Available Colors

**Basic Colors:** black, white, red, blue, yellow, green  
**Extended Colors:** orange, purple, pink, cyan, magenta, lime, navy, maroon, teal, olive, silver, gold

All colors are defined in CMYK color space for professional printing compatibility.

### Deno Tasks

```bash
# Run with default settings
deno task start

# Show help
deno task help
```

## Banner Layout Specifications

### Fixed Layout Parameters

- **Outer margin:** 25mm from PDF edges (non-configurable)
- **Border thickness:** 0.5mm (non-configurable)
- **Corner circles:** 12mm diameter, centered 37.5mm from PDF edges
- **Background:** Two-layer system (white base + colored rectangle)

### Circle Placement System

The application automatically calculates and places mounting circles:

1. **4 Corner circles** - Always present at fixed positions
2. **Intermediate circles** - Added when distance between corners ≥ 500mm
   - Distributed evenly along edges
   - Minimum 500mm spacing maintained
   - Calculated spacing: `available_distance / (num_circles + 1)`

**Examples:**
- 3000mm width → 5 intermediate circles per horizontal edge (487.5mm spacing)
- 5000mm width → 9 intermediate circles per horizontal edge (492.5mm spacing)

## Font System

### Primary Font
- **DejaVu Sans Condensed Bold** - Compact font with excellent Unicode support
- Included as `DejaVuSansCondensed-Bold.ttf` in the project

### Fallback Hierarchy
1. Custom TTF file (DejaVuSansCondensed-Bold.ttf)
2. System DejaVu Sans Bold (/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf)
3. Helvetica Bold (built-in PDF font)

## Text Positioning

### Vertical Centering Algorithm

The application uses a sophisticated centering algorithm that accounts for:
- Font baseline vs visual center offset
- Multi-line text block height calculation
- Visual alignment compensation (0.35 × font size)
- Half line height adjustment for perfect alignment

**Note:** The vertical centering formula has been extensively tested and fine-tuned. Modifications should only be made with thorough testing across different font sizes and orientations.

## Examples

### Standard Business Banner
```bash
deno run --allow-all main.ts \
  --text "AUTHORIZED DEALER" \
  --width 2000 \
  --height 600 \
  --font-size 35 \
  --fg white \
  --bg navy
```

### Event Promotion Banner
```bash
deno run --allow-all main.ts \
  --text $'SUMMER SALE\n50% OFF\nLimited Time!' \
  --width 1500 \
  --height 800 \
  --font-size 25 \
  --fg red \
  --bg yellow
```

### Large Format Banner
```bash
deno run --allow-all main.ts \
  --text "NOW OPEN" \
  --width 5000 \
  --height 1200 \
  --font-size 50 \
  --fg yellow \
  --bg red
```

## Technical Details

- **PDF Library:** pdf-lib with fontkit for custom font support
- **Color Space:** CMYK for professional printing compatibility
- **Coordinate System:** PostScript points (1 point = 1/72 inch)
- **Font Metrics:** Precise text measurement for accurate positioning
- **Unicode Support:** Full Unicode glyph support through DejaVu fonts

## Development

### Project Structure
```
pdf-banner/
├── main.ts                          # Main application file
├── deno.json                        # Deno configuration and dependencies
├── deno.lock                        # Locked dependencies
├── DejaVuSansCondensed-Bold.ttf     # Custom font file
├── AI_RULES.md                      # Development guidelines and algorithms
├── README.md                        # This file
└── .vscode/                         # VS Code configuration
    ├── launch.json
    └── settings.json
```

### Testing

Test the application with various configurations:
- Different font sizes (3mm, 12mm, 25mm, 40mm)
- Portrait and landscape orientations
- Single-line and multi-line text
- Different banner dimensions
- All available colors

## License

MIT License - see LICENSE file for details.

## Author

Paweł Jabłoński

---

**Note:** This tool is specifically designed for PVC banner production with standardized mounting systems. The circle placement and margin specifications follow industry standards for commercial banner printing.
