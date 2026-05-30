# PRAYAS - Bespoke UI/UX Design System

## 1. Visual Identity & Design Philosophy
**Aesthetic Direction**: "Industrial Blueprint & Swiss Precision". 
We are abandoning the overused "Dark Mode + Purple/Blue Glow" (which is the standard AI/SaaS template trope). Instead, we are pivoting to a highly structural, aggressive, and purely functional aesthetic inspired by industrial machinery, high-end engineering schematics, and Swiss typography.
- Visible structural grid lines.
- Absolute minimal use of color; color is strictly for functional utility.
- No glowing effects, no gradients, no soft shadows.
- Brutalist but highly refined.

**Typography**:
- **Primary**: `Space Grotesk` or `Inter` (tightly tracked) - Cold, objective, and highly legible.
- **Secondary/Monospace**: `JetBrains Mono` - Used extensively for all data, time, metrics, and navigation.

## 2. Calibrated Color Palette (Industrial)

| Role | Hex Code | Description |
| :--- | :--- | :--- |
| **Base Background** | `#0a0a0a` | Absolute deep black. |
| **Surface** | `#141414` | Slightly raised panels. |
| **Grid / Borders** | `#333333` | Hard, visible structural lines forming the layout. |
| **Text Primary** | `#ededed` | High contrast paper-white. |
| **Text Secondary** | `#737373` | Objective grey for secondary labels. |
| **Accent Primary (Volt/Safety)**| `#ccff00` | A piercing, electric volt-yellow. Used ONLY for active states, critical data, and hover interactions. Stripping away the "AI purple". |
| **Success / Low Risk** | `#00ff9d` | Functional green. |
| **Warning / Medium Risk**| `#ffae00` | Functional orange. |
| **Danger / High Risk** | `#ff2a55` | Functional red. |

## 3. Layout Constraints & Structural Rules
- **The Visible Grid**: The entire application is built on a visible grid. Elements do not float in space; they are confined within hard `1px solid #333333` borders. Adjacent panels share borders (like a spreadsheet or a mosaic).
- **Zero Border Radius**: Absolutely no rounded corners anywhere. `border-radius: 0`.
- **Spacing**: Rigid and mathematical padding inside the grid cells (e.g., exactly `24px` everywhere).
- **Micro-Interactions**: Hover states do not lift or glow. Instead, they structurally invert (e.g., background turns Volt Yellow `#ccff00`, text turns black `#0a0a0a`). Immediate, 0ms transitions for a snappy, hardware-like feel.

## 4. Bespoke Component Guidelines
### Cards / Grid Cells
- **Structure**: No margins between cards. They are flush against each other, separated by the grid borders.
- **Header**: Monospace, uppercase, separated by a bottom border from the content.
- **Hover State**: A harsh Volt Yellow left-border indent (`border-left: 4px solid #ccff00`), or full-cell background color shift for buttons.

### Buttons & Inputs
- **Buttons**: Stark rectangles. No background. Border: `1px solid #ededed`. Text: uppercase, monospace. On hover, background instantly snaps to Volt Yellow `#ccff00` and text to `#0a0a0a`.
- **Inputs**: Flat. Background `#141414`. Border bottom only, or fully boxed in the grid. Focus state changes the border to Volt Yellow.

### Navigation / Header
- **Structure**: The header is just another row in the grid.
- **Active State**: Inverts the colors of the active tab. No floating underline.
