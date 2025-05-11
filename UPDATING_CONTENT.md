# How to Update Studio Content (Clothing, Backgrounds, Prompts)

This guide provides step-by-step instructions on how to modify the clothing options, background options, and the underlying prompt generation logic for the AI headshot studio.

## 1. Updating Clothing Options

Clothing options are defined in `app/dashboard/studio/create/components/Forms/ClothingSelector.jsx`.

**Steps:**

1.  **Open the file**: Navigate to and open `app/dashboard/studio/create/components/Forms/ClothingSelector.jsx`.
2.  **Locate `CLOTHING_OPTIONS`**: Find the `CLOTHING_OPTIONS` constant. It's an object where keys are theme names (e.g., "Business Professional") and values are arrays of clothing items.
    ```javascript
    // Example structure:
    const CLOTHING_OPTIONS = {
      "Business Professional": [
        { name: "Navy Blue Suit", image: "/placeholder.svg" },
        { name: "Charcoal Grey Suit", image: "/placeholder.svg" },
      ],
      "Business Casual": [
        { name: "Khaki Trousers & Blazer", image: "/placeholder.svg" },
        // ... more items
      ],
      // ... more themes
    };
    ```
3.  **To Add a New Clothing Theme**:
    - Add a new key-value pair to the `CLOTHING_OPTIONS` object. The key is the theme name (string), and the value is an array of clothing items.
    ```javascript
    "New Theme Name": [
      { name: "Clothing Item 1 in New Theme", image: "/path/to/image1.jpg" },
      { name: "Clothing Item 2 in New Theme", image: "/path/to/image2.jpg" },
    ],
    ```
4.  **To Add a New Clothing Item to an Existing Theme**:
    - Find the theme's array and add a new object `{ name: "Your New Clothing Item", image: "/path/to/your/image.jpg" }` to it.
5.  **To Modify an Existing Clothing Item**:
    - Edit the `name` or `image` path of the desired item within its theme.
6.  **To Remove a Clothing Item or Theme**:
    - Delete the item object from its theme's array or delete the entire theme key-value pair.
7.  **Image Paths**:
    - Ensure the `image` paths are correct. They should typically be relative to the `public` directory (e.g., `/images/clothing/navy-suit.jpg`). For placeholders, you might use something like `/placeholder.svg`.

**Important**:

- The `theme` name you define here (e.g., "Business Professional") will be used in `utils/prompts.js` to match clothing items with compatible prompt templates. Ensure consistency.
- After making changes, the "All" tab will automatically include new items.

## 2. Updating Background Options

Background options are defined in `app/dashboard/studio/create/components/Forms/BackgroundSelector.jsx`. The process is very similar to updating clothing options.

**Steps:**

1.  **Open the file**: Navigate to and open `app/dashboard/studio/create/components/Forms/BackgroundSelector.jsx`.
2.  **Locate `BACKGROUND_OPTIONS`**: Find the `BACKGROUND_OPTIONS` constant. It has the same structure as `CLOTHING_OPTIONS`.
    ```javascript
    // Example structure:
    const BACKGROUND_OPTIONS = {
      "Studio (Solid Colors)": [
        { name: "Grey Studio Backdrop", image: "/placeholder.svg" },
        // ... more items
      ],
      "Office (Modern or Traditional)": [
        { name: "Modern Office Interior", image: "/placeholder.svg" },
        // ... more items
      ],
      // ... more themes
    };
    ```
3.  **To Add/Modify/Remove Themes or Items**: Follow the same steps as outlined for `CLOTHING_OPTIONS` above, but apply them to the `BACKGROUND_OPTIONS` constant.
4.  **Image Paths**: Ensure correct image paths, typically relative to the `public` directory.

**Important**:

- The `theme` name for backgrounds (e.g., "Studio (Solid Colors)") will be used in `utils/prompts.js` to match backgrounds with compatible prompt templates. Ensure consistency.
- The "All" tab will automatically reflect any changes.

## 3. Updating Prompt Templates & Theme Compatibility

The logic for generating image prompts based on user selections (character details, clothing, background) is primarily in `utils/prompts.js`.

**Steps:**

1.  **Open the file**: Navigate to and open `utils/prompts.js`.
2.  **Locate `PROMPT_TEMPLATES`**: This is an array of objects, where each object defines a specific prompt template.
    ```javascript
    // Example structure of a single template object:
    {
      id: "studio_solid_biz_prof_01", // Unique identifier
      name: "Studio Solid - Business Professional", // Descriptive name for easier management
      description: "Clean, professional studio shot on a solid background.",
      compatibleClothingThemes: [ // Array of clothing themes this template works well with
        "Business Professional",
        "Executive / Luxury Branding",
      ],
      compatibleBackgroundThemes: [ // Array of background themes this template works well with
        "Studio (Solid Colors)",
      ],
      promptFunction: (character, clothingName, backgroundName) => {
        // Logic to construct the actual prompt string
        const bgColor = /* ... logic based on backgroundName ... */ ;
        return `photorealistic studio portrait of ohwx, ${character.ethnicity} ${character.gender} in ${character.age} ... wearing ${clothingName}. Background is a plain solid ${bgColor}. ...`;
      },
    }
    ```
3.  **Understanding Template Structure**:

    - `id`: A unique string identifier for the template.
    - `name`: A human-readable name for the template.
    - `description`: A brief description of what the template aims to achieve.
    - `compatibleClothingThemes`: An array of strings. These strings **must exactly match** the theme names defined as keys in `CLOTHING_OPTIONS` (from `ClothingSelector.jsx`). A template can also use `"Any"` to be compatible with all clothing themes.
    - `compatibleBackgroundThemes`: An array of strings. These strings **must exactly match** the theme names defined as keys in `BACKGROUND_OPTIONS` (from `BackgroundSelector.jsx`). A template can also use `"Any"` to be compatible with all background themes.
    - `promptFunction`: A JavaScript function that takes `character` (object with user's physical attributes), `clothingName` (string), and `backgroundName` (string) as arguments. It must return the final prompt string to be sent to the image generation AI.

4.  **To Add a New Prompt Template**:

    - Add a new object to the `PROMPT_TEMPLATES` array, following the structure described above.
    - Define its `compatibleClothingThemes` and `compatibleBackgroundThemes` carefully to match the themes from your selector components.
    - Implement the `promptFunction` to generate the desired prompt string using the provided inputs.

5.  **To Modify an Existing Prompt Template**:

    - Locate the template object by its `id` or `name`.
    - Adjust its `compatibleClothingThemes`, `compatibleBackgroundThemes`, or the logic within its `promptFunction`. For example, you might change wording, add details, or adjust how it incorporates `clothingName` and `backgroundName`.

6.  **To Remove a Prompt Template**:

    - Delete the corresponding object from the `PROMPT_TEMPLATES` array.

7.  **Theme Consistency is Key**:

    - The `generatePrompts` function in `utils/prompts.js` works by finding templates whose `compatibleClothingThemes` include the theme of the selected clothing, and whose `compatibleBackgroundThemes` include the theme of the selected background.
    - If you rename a theme in `ClothingSelector.jsx` or `BackgroundSelector.jsx`, you **must** update all `PROMPT_TEMPLATES` that reference that theme in their `compatibleClothingThemes` or `compatibleBackgroundThemes` arrays.

8.  **Fallback Generic Template**:
    - There's a template with `id: "generic_any_any_01"` that serves as a fallback. It typically has `"Any"` in both `compatibleClothingThemes` and `compatibleBackgroundThemes`. This ensures that a prompt can usually be generated even if no highly specific template matches the user's clothing/background theme combination. You can customize this fallback as needed.

## General Advice

- **Backup Files**: Before making significant changes, consider backing up the relevant files (`ClothingSelector.jsx`, `BackgroundSelector.jsx`, `prompts.js`).
- **Image Placeholders vs. Actual Images**: When adding new clothing or background items, initially, you might use placeholder images (e.g., `/placeholder.svg`). Remember to replace these with actual, high-quality images for production and update the paths accordingly.
- **Testing**: After any changes:
  - Thoroughly test the studio creation flow.
  - Ensure new clothing/background options appear correctly in their respective tabs and the "All" tab.
  - Verify that selecting combinations involving new/modified themes and items results in appropriate prompts being generated (you can `console.log` the output of `generatePrompts` in `page.jsx` during testing).
  - Check for any console errors in your browser.
- **Naming Conventions**: Maintain consistent naming conventions for themes and items to make management easier.

By following these steps, you can customize and expand the content available in your AI headshot studio.
