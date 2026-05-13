# Modeled Hair Engine: Comprehensive Hair Taxonomy and Classification System

## 1. Introduction

This document outlines a comprehensive and scientifically-grounded taxonomy for the Modeled Hair Engine. This taxonomy is designed to be the foundational data model for hair analysis, supporting both the machine learning models and the user-facing application. It integrates industry-standard classification systems with a detailed set of hair and scalp attributes, providing a holistic view of hair characteristics.

This taxonomy is a synthesis of:

*   **Industry-Standard Classification Systems:** Andre Walker Hair Typing System, LOIS Hair Typing System, and the FIA system.
*   **Scientific Trichology Metrics:** Incorporating measurable attributes of hair morphology, health, and appearance.
*   **Modeled-Specific Attributes:** Including style state, product presence, and other contextual information relevant to the Modeled platform.

## 2. Core Principles

*   **Scientific Accuracy:** The taxonomy is grounded in established scientific principles of trichology and hair science.
*   **Inclusivity:** The system is designed to be inclusive of all hair types, textures, and styles, with a particular focus on avoiding biases present in older classification systems.
*   **Extensibility:** The taxonomy is designed to be extensible, allowing for the addition of new attributes and classifications as the Modeled Hair Engine evolves.
*   **User-Centric:** The taxonomy is designed to be understandable and useful for both hair care professionals and consumers.

## 3. Taxonomy Structure

The taxonomy is organized into the following high-level categories:

1.  **Hair Profile:** The core classification of the hair, including curl pattern, thickness, and volume.
2.  **Hair Morphology:** The physical characteristics of the hair strands.
3.  **Hair Appearance:** The visual characteristics of the hair.
4.  **Hair Color:** The natural and artificial color of the hair.
5.  **Hair Health:** Indicators of the hair's condition and damage.
6.  **Scalp & Root:** The condition of the scalp and hair roots.
7.  **Style & State:** The current style and condition of the hair.
8.  **Contextual Factors:** Environmental and imaging conditions that can affect hair analysis.

## 4. Detailed Taxonomy

### 4.1. Hair Profile

This section defines the primary classification of the hair, combining curl pattern, strand thickness, and overall volume, inspired by the FIA system.

| Attribute | Description | Data Type | Possible Values |
|---|---|---|---|
| **Curl Pattern** | The primary shape of the hair strands, based on the Andre Walker system. | Enum | `1A`, `1B`, `1C`, `2A`, `2B`, `2C`, `3A`, `3B`, `3C`, `4A`, `4B`, `4C` |
| **Strand Thickness** | The diameter of individual hair strands. | Enum | `Fine`, `Medium`, `Coarse` |
| **Hair Volume/Density** | The overall thickness of the hair, or the number of strands per unit area. | Enum | `Low`, `Medium`, `High` |

### 4.2. Hair Morphology

This section details the physical properties of the hair strands, providing a more granular, scientific view.

| Attribute | Description | Data Type | Possible Values/Units |
|---|---|---|---|
| **Cross-Sectional Shape** | The shape of the hair strand's cross-section, which influences curl pattern. | Enum | `Round`, `Oval`, `Elliptical`, `Flat` |
| **Diameter** | The measured thickness of an individual hair strand. | Number | Micrometers (μm) |
| **Porosity** | The hair's ability to absorb and retain moisture. | Enum | `Low`, `Medium`, `High` |
| **Elasticity** | The hair's ability to stretch and return to its original length without breaking. | Enum | `Low`, `Medium`, `High` |
| **Tensile Strength** | The resistance of the hair to breaking under tension. | Enum | `Weak`, `Normal`, `Strong` |

### 4.3. Hair Appearance

This section describes the visual characteristics of the hair.

| Attribute | Description | Data Type | Possible Values |
|---|---|---|---|
| **Length** | The overall length of the hair. | Enum | `Buzzed`, `Short`, `Medium`, `Long`, `Extra Long` |
| **Volume** | The visual fullness or body of the hair. | Enum | `Flat`, `Moderate`, `High`, `Very High` |
| **Texture** | The visual surface pattern of the hair. | Enum | `Straight`, `Wavy`, `Curly`, `Coily`, `Zig-zag` |
| **Shine** | The light reflection from the hair surface. | Enum | `Matte`, `Natural`, `Glossy`, `High Shine` |
| **Frizz Level** | The degree of hair strand misalignment. | Enum | `None`, `Low`, `Medium`, `High` |
| **Flyaways** | The presence of short, stray hairs. | Enum | `None`, `Some`, `Many` |
| **Split Ends** | The condition of the hair strand tips. | Enum | `None`, `Mild`, `Moderate`, `Severe` |

### 4.4. Hair Color

This section details the natural and artificial color of the hair.

| Attribute | Description | Data Type | Possible Values |
|---|---|---|---|
| **Natural Color** | The naturally occurring hair color. | Enum | `Black`, `Brown`, `Blonde`, `Red`, `Gray`, `White` |
| **Artificial Color** | The type of artificial hair coloring technique used. | Enum | `None`, `Single-process`, `Highlights`, `Balayage`, `Ombre`, `Fantasy` |
| **Color Depth** | The lightness or darkness of the hair color on a scale from 1 to 10. | Integer | 1-10 |
| **Undertone** | The underlying tone of the hair color. | Enum | `Cool`, `Neutral`, `Warm` |

### 4.5. Hair Health

This section provides indicators of the hair's overall health and condition.

| Attribute | Description | Data Type | Possible Values |
|---|---|---|---|
| **Cuticle Condition** | The condition of the outermost layer of the hair. | Enum | `Smooth`, `Slightly Raised`, `Raised`, `Damaged` |
| **Breakage** | The extent of hair strand breakage. | Enum | `None`, `Mild`, `Moderate`, `Severe` |
| **Hydration** | The moisture level of the hair. | Enum | `Dry`, `Balanced`, `Moisturized` |
| **Heat Damage** | Indicators of damage from heat styling tools. | Enum | `None`, `Mild`, `Moderate`, `Severe` |
| **Chemical Damage** | Indicators of damage from chemical treatments. | Enum | `None`, `Mild`, `Moderate`, `Severe` |

### 4.6. Scalp & Root

This section focuses on the condition of the scalp and the hair at the roots.

| Attribute | Description | Data Type | Possible Values |
|---|---|---|---|
| **Scalp Condition** | The health and appearance of the scalp. | Enum | `Normal`, `Dry`, `Oily`, `Flaky`, `Irritated` |
| **Root Lift** | The volume at the roots of the hair. | Enum | `Flat`, `Moderate`, `High` |
| **Regrowth Visibility** | The visibility of natural roots after coloring. | Enum | `None`, `Mild`, `Strong` |

### 4.7. Style & State

This section describes the current styling and condition of the hair.

| Attribute | Description | Data Type | Possible Values |
|---|---|---|---|
| **Style State** | The current styling or protective state of the hair. | Enum | `Natural`, `Blowout`, `Silk Press`, `Braids`, `Twists`, `Locs`, `Wig`, `Weave`, `Extensions`, `Updo`, `Ponytail`, `Protective Style` |
| **Product Presence** | Styling products visible or inferred in the hair. | Enum | `None`, `Gel`, `Cream`, `Oil`, `Mousse`, `Hairspray`, `Heat Protectant` |
| **Manipulation Level** | The degree of styling or handling applied to the hair. | Enum | `Low`, `Medium`, `High` |

### 4.8. Contextual Factors

This section includes factors related to the image itself that can influence the analysis.

| Attribute | Description | Data Type | Possible Values |
|---|---|---|---|
| **Lighting** | The lighting condition in the image. | Enum | `Natural`, `Artificial`, `Backlit`, `Overexposed`, `Underexposed` |
| **Image Quality** | The clarity of the image. | Enum | `Sharp`, `Slightly Blurry`, `Blurry` |
| **Obstructions** | Visual obstructions affecting the analysis. | Enum | `None`, `Face Covered`, `Hair Covered`, `Accessories Blocking` |
