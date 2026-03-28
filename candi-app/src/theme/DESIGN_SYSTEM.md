# CANDI Design System Documentation

## Overview

The CANDI Design System is a comprehensive set of guidelines and reusable components built to create a consistent, accessible, and user-friendly interface for cancer patients. This system prioritizes **accessibility, clarity, and emotional support**.

---

## 🎨 Design Principles

### 1. **Accessibility First**
- Minimum font size for reading text: **16px**
- Color contrast ratios meet **WCAG AA standards**
- Clear focus states (visual feedback for interactive elements)
- Simple, uncluttered layouts

### 2. **Consistency**
- All design decisions use centralized tokens
- No hardcoded values in components
- Reusable, standardized components
- Predictable patterns across the app

### 3. **Clarity**
- Simple language and clear navigation
- Visual hierarchy is obvious
- Icons and labels are clear and intuitive
- Error messages are helpful, not confusing

### 4. **Emotional Support**
- Warm, welcoming colors (primary pink)
- Generous spacing and breathing room
- Simple, reassuring interactions
- Never confusing or broken-looking

---

## 📦 Design Tokens

All design values are defined in `/src/theme/tokens.ts`. Always use these tokens instead of hardcoding values.

### Spacing Scale (8px base unit)

```typescript
import { spacing } from '@/theme/tokens';

spacing.xs    // 4px   - Micro spacing
spacing.sm    // 8px   - Small spacing between elements
spacing.md    // 12px  - Medium spacing
spacing.base  // 16px  - Primary spacing unit (most common)
spacing.lg    // 24px  - Large section spacing
spacing.xl    // 32px  - Extra large spacing
spacing.xxl   // 48px  - Page margins
```

**Usage:**
```tsx
// ✅ CORRECT - Use tokens
<View style={{ padding: spacing.base, marginBottom: spacing.lg }}>
  {children}
</View>

// ❌ WRONG - Never hardcode values
<View style={{ padding: 16, marginBottom: 24 }}>
  {children}
</View>

// ❌ WRONG - Never use arbitrary values
<View style={{ marginTop: 13, paddingLeft: 5 }}>
  {children}
</View>
```

### Colors

```typescript
import { colors } from '@/theme/tokens';

// Primary Brand Color
colors.primary.rosa_full    // #FFC4C4 - Use for main CTAs
colors.primary.rosa_light   // #FFE9E9 - Use for hover/secondary states

// Secondary Colors
colors.secondary.mint       // #CFFFE5 - Secondary actions
colors.secondary.blue       // #759AAB - Tertiary actions
colors.secondary.blue_light // #8cb2c4 - Light blue variant

// Neutral Colors
colors.neutral.white        // #FFFFFF - Card/primary background
colors.neutral.light_gray   // #f6f6f6 - Page background
colors.neutral.form_field   // #eeeeeeff - Input background (inactive)
colors.neutral.gray         // #CCCCCC - Borders, dividers

// Text Colors
colors.text.primary         // #333333 - Primary text (highest contrast)
colors.text.secondary       // #545F71 - Secondary text
colors.text.tertiary        // #666666 - Tertiary text
colors.text.placeholder     // #888888 - Placeholder text

// States
colors.states.error         // #ff6b6b - Error/validation red
colors.states.success       // #4CAF50 - Success green
colors.states.warning       // #FFA500 - Warning orange
colors.states.disabled      // #CCCCCC - Disabled elements
```

**Usage:**
```tsx
import { colors } from '@/theme/tokens';

// ✅ CORRECT
<Text style={{ color: colors.text.primary }}>Texto Principal</Text>
<View style={{ backgroundColor: colors.primary.rosa_full }}>
  <Button title="Enviar" />
</View>

// ❌ WRONG - Never hardcode hex values
<Text style={{ color: '#333333' }}>Texto Principal</Text>
<View style={{ backgroundColor: '#FFC4C4' }}>
  <Button title="Enviar" />
</View>
```

### Typography

```typescript
import { typography } from '@/theme/tokens';

// Font Families
typography.fonts.body           // Inter Regular - Body text
typography.fonts.body_medium    // Inter Medium - Medium weight
typography.fonts.heading        // Kadwa Bold - Headings
typography.fonts.heading_regular // Kadwa Regular - Display text

// Font Sizes (minimum 16px for reading)
typography.sizes.body_large     // 16px - Primary reading text ⭐
typography.sizes.body_medium    // 14px - Secondary text
typography.sizes.body_small     // 12px - Helper text only
typography.sizes.label_large    // 14px - Button/label text
typography.sizes.title_medium   // 16px - Medium titles
typography.sizes.title_large    // 22px - Large titles
typography.sizes.heading_small  // 24px - Section headings
typography.sizes.heading_medium // 28px - Page headings
typography.sizes.heading_large  // 32px - Major headings
```

**Usage:**
```tsx
import { typography } from '@/theme/tokens';

// ✅ CORRECT - Use at least 16px for body text
<Text style={{
  fontSize: typography.sizes.body_large, // 16px
  fontFamily: typography.fonts.body,
  lineHeight: typography.lineHeights.normal // 1.5
}}>
  Este é o texto principal do aplicativo
</Text>

// ❌ WRONG - Small text hurts accessibility
<Text style={{ fontSize: 11, fontFamily: 'Inter' }}>
  Texto muito pequeno
</Text>
```

### Border Radius

```typescript
import { borderRadius } from '@/theme/tokens';

borderRadius.none      // 0px
borderRadius.small     // 8px
borderRadius.medium    // 12px
borderRadius.large     // 24px
borderRadius.full      // 50px - For buttons and inputs
```

---

## 🔘 Button Component

The `Button` component is the only button component to use. It replaces all duplicated button files (buttonCustom, AddButton, sendButton, etc.).

### Props

```typescript
interface ButtonProps {
  title: string;                           // Button text (required)
  onPress: () => void;                     // Callback (required)
  variant?: 'primary' | 'secondary' | 'outline'; // Visual style
  disabled?: boolean;                      // Disable the button
  loading?: boolean;                       // Show loading state
  loadingLabel?: string;                   // Custom loading text
  style?: ViewStyle;                       // Custom styles
}
```

### Variants

#### Primary (Default)
- **Use for:** Main call-to-action buttons
- **Color:** Pink (#FFC4C4)
- **When:** Save, Submit, Confirm actions

```tsx
<Button
  variant="primary"
  title="Salvar Compromisso"
  onPress={handleSave}
/>
```

#### Secondary
- **Use for:** Secondary actions
- **Color:** Mint (#CFFFE5)
- **When:** Alternative actions, secondary options

```tsx
<Button
  variant="secondary"
  title="Salvar Como Rascunho"
  onPress={handleSaveDraft}
/>
```

#### Outline
- **Use for:** Tertiary/less important actions
- **Color:** Blue border on white background
- **When:** Cancel, Learn More, Back buttons

```tsx
<Button
  variant="outline"
  title="Cancelar"
  onPress={handleCancel}
/>
```

### Examples

```tsx
import Button from '@/components/Buttons/Button';

// Basic primary button
<Button title="Continuar" onPress={handleNext} />

// With loading state
<Button
  title="Enviando..."
  onPress={handleSubmit}
  loading={isLoading}
  loadingLabel="Enviando"
/>

// Disabled button
<Button
  title="Salvar"
  onPress={handleSave}
  disabled={!formIsValid}
/>

// Secondary button
<Button
  title="Próximo Passo"
  onPress={handleNext}
  variant="secondary"
/>

// Outline button
<Button
  title="Cancelar"
  onPress={handleCancel}
  variant="outline"
/>
```

---

## 📝 Input Component

The `Input` component is the standard text input. It replaces duplicated input files (inputName, inputEmail, inputPassword, etc.).

### Props

```typescript
interface InputProps extends TextInputProps {
  label?: string;                    // Placeholder/label
  value: string;                     // Input value (required)
  onChangeText: (text: string) => void; // Change callback (required)
  icon?: string;                     // MaterialIcons icon name
  iconColor?: string;                // Custom icon color
  isValid?: boolean | undefined;     // Validation state
  errorMessage?: string;             // Error message to show
  style?: any;                       // Custom styles
  // All standard TextInput props supported
}
```

### Features

- ✅ Accessible: 16px font size minimum
- ✅ Focus state: Pink border when focused
- ✅ Icon support with color change on focus
- ✅ Error state with red border and error message
- ✅ Consistent spacing and styling
- ✅ Proper touch targets (56px height)

### Examples

```tsx
import Input from '@/components/Inputs/Input';

// Basic text input
<Input
  label="Nome Completo"
  value={name}
  onChangeText={setName}
/>

// Email input
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  icon="mail"
/>

// With validation
<Input
  label="Telefone"
  value={phone}
  onChangeText={setPhone}
  icon="phone"
  isValid={isValidPhone}
  errorMessage={!isValidPhone ? "Telefone inválido" : undefined}
/>

// Password input
<Input
  label="Senha"
  value={password}
  onChangeText={setPassword}
  icon="lock"
  secureTextEntry={true}
/>

// Search input
<Input
  label="Buscar medicamento"
  value={search}
  onChangeText={setSearch}
  icon="search"
/>
```

---

## 🖼️ Screen Layout Pattern

All screens should follow this standardized spacing pattern:

```tsx
import { spacing } from '@/theme/tokens';
import { View, ScrollView } from 'react-native';

export default function MyScreen() {
  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: spacing.base }}
      style={{ paddingTop: spacing.lg }}
    >
      {/* Header Section */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text>Page Title</Text>
      </View>

      {/* Form Section - use spacing.base between fields */}
      <View style={{ marginBottom: spacing.lg }}>
        <Input label="Field 1" value={val1} onChangeText={setVal1} />
        <Input label="Field 2" value={val2} onChangeText={setVal2} />
      </View>

      {/* Button Section - use spacing.lg above buttons */}
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}>
        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}
```

### Spacing Guidelines

| Context | Spacing Token | Use Case |
|---------|---------------|----------|
| Between form fields | `spacing.base` (16px) | Default gap between inputs |
| Section margins | `spacing.lg` (24px) | Between major sections |
| Page padding | `spacing.base` (16px) | Horizontal page padding |
| Large spacing | `spacing.xl` (32px) | Below form before buttons |
| Component margins | Remove custom margins | Let parent handle spacing |

**Before (❌ Inconsistent):**
```tsx
<View style={{ marginTop: 13, paddingHorizontal: 10 }}>
  <Input ... />
  <Input style={{ margin: 16 }} />
  <Button style={{ marginTop: 24 }} />
</View>
```

**After (✅ Consistent):**
```tsx
<View style={{ paddingHorizontal: spacing.base }}>
  <Input label="Field 1" value={val1} onChangeText={setVal1} />
  <Input label="Field 2" value={val2} onChangeText={setVal2} />
  <Button title="Submit" onPress={handleSubmit} style={{ marginTop: spacing.lg }} />
</View>
```

---

## 🎯 Migration Guide

### Step 1: Replace Buttons

Replace all button component imports:

```tsx
// ❌ OLD
import AddButton from '@/components/Buttons/AddButton';
import sendButton from '@/components/Buttons/sendButton';

// ✅ NEW
import Button from '@/components/Buttons/Button';

// Use the Button component with variants
<Button title="Adicionar" onPress={handleAdd} variant="primary" />
```

### Step 2: Replace Inputs

Replace all input component imports:

```tsx
// ❌ OLD
import InputName from '@/components/Inputs/inputName';
import InputEmail from '@/components/Inputs/inputEmail';

// ✅ NEW
import Input from '@/components/Inputs/Input';

// Use the Input component
<Input label="Nome" value={name} onChangeText={setName} icon="person" />
<Input label="Email" value={email} onChangeText={setEmail} icon="mail" />
```

### Step 3: Update Screen Spacing

Replace arbitrary margins with design tokens:

```tsx
// ❌ OLD
<View style={{ paddingHorizontal: 10, marginTop: 5 }}>

// ✅ NEW
<View style={{ paddingHorizontal: spacing.base, marginTop: spacing.sm }}>
```

### Step 4: Use Color Tokens

Replace hardcoded colors:

```tsx
// ❌ OLD
<View style={{ backgroundColor: '#FFC4C4' }}>
<Text style={{ color: '#333333' }}>

// ✅ NEW
<View style={{ backgroundColor: colors.primary.rosa_full }}>
<Text style={{ color: colors.text.primary }}>
```

---

## 📊 Color Palette Reference

### Primary Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Rosa Full (Primary Pink) | #FFC4C4 | Main CTAs, primary buttons, focus states |
| Rosa Light | #FFE9E9 | Hover states, secondary accents |

### Secondary Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Mint | #CFFFE5 | Secondary buttons, alternative actions |
| Blue | #759AAB | Tertiary buttons, outline borders |
| Blue Light | #8cb2c4 | Hover states, lighter accents |

### Neutral Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| White | #FFFFFF | Card backgrounds, primary backgrounds |
| Light Gray | #f6f6f6 | Page background |
| Form Field Gray | #eeeeeeff | Input backgrounds (inactive) |
| Gray | #CCCCCC | Borders, dividers, disabled states |

### Text Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Text | #333333 | Primary text, highest contrast |
| Secondary Text | #545F71 | Secondary text, lower emphasis |
| Tertiary Text | #666666 | Tertiary text, de-emphasized |
| Placeholder | #888888 | Placeholder text, hints |

### State Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Error Red | #ff6b6b | Error messages, validation failures |
| Success Green | #4CAF50 | Success messages, confirmations |
| Warning Orange | #FFA500 | Warnings, cautions |
| Disabled Gray | #CCCCCC | Disabled elements, inactive states |

---

## ✅ Accessibility Checklist

- [ ] Minimum font size is 16px for body text
- [ ] Color contrast ratios meet WCAG AA standards
- [ ] Interactive elements have clear focus states
- [ ] Buttons use touch-friendly sizes (minimum 56px height)
- [ ] Icons have accessible labels
- [ ] Form inputs have labels and error messages
- [ ] No information conveyed by color alone
- [ ] Spacing is generous and clear

---

## 📚 Related Files

- **Design Tokens:** `/src/theme/tokens.ts`
- **Theme Configuration:** `/src/theme/index.ts`
- **Button Component:** `/src/components/Buttons/Button.tsx`
- **Input Component:** `/src/components/Inputs/Input.tsx`

---

## 🚀 Next Steps

1. Update all screens to use the new spacing tokens
2. Replace button components with `Button` throughout the app
3. Replace input components with `Input` throughout the app
4. Update icon usage to use bold stroke style (strokeWidth: 2.5)
5. Test with real users for accessibility
6. Document any project-specific additions to the design system

---

## 💬 Questions?

This design system is a living document. As you implement these guidelines:
- If something is unclear, add clarification to this document
- If you find a pattern not covered, add it
- If you have suggestions for improvements, discuss with the team
