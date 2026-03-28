# CANDI Design System - Quick Reference Card

## 🚀 Quick Imports

```tsx
// Components
import Button from '@/components/Buttons/Button';
import Input from '@/components/Inputs/Input';

// Design Tokens
import { spacing, colors, typography, borderRadius } from '@/theme/tokens';
```

---

## 🔘 Button Component

```tsx
// Primary Button (Main CTA)
<Button
  title="Salvar"
  onPress={handleSave}
  variant="primary"
/>

// Secondary Button
<Button
  title="Próximo"
  onPress={handleNext}
  variant="secondary"
/>

// Outline Button
<Button
  title="Cancelar"
  onPress={handleCancel}
  variant="outline"
/>

// With Loading
<Button
  title="Enviando..."
  onPress={handleSubmit}
  loading={isLoading}
/>

// Disabled
<Button
  title="Salvar"
  onPress={handleSave}
  disabled={!formIsValid}
/>
```

---

## 📝 Input Component

```tsx
// Basic
<Input
  label="Nome"
  value={name}
  onChangeText={setName}
/>

// With Icon
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  icon="mail"
  keyboardType="email-address"
/>

// With Validation
<Input
  label="Telefone"
  value={phone}
  onChangeText={setPhone}
  icon="phone"
  isValid={isValidPhone(phone)}
  errorMessage={!isValidPhone(phone) ? "Inválido" : undefined}
/>

// Password
<Input
  label="Senha"
  value={password}
  onChangeText={setPassword}
  icon="lock"
  secureTextEntry={true}
/>
```

---

## 📐 Spacing Scale

| Token | Size | Usage |
|-------|------|-------|
| `spacing.xs` | 4px | Micro spacing |
| `spacing.sm` | 8px | Small gaps |
| `spacing.md` | 12px | Medium spacing |
| `spacing.base` | 16px | **Most common** |
| `spacing.lg` | 24px | Section gaps |
| `spacing.xl` | 32px | Large sections |
| `spacing.xxl` | 48px | Page margins |

**Quick Replace:**
- `8` → `spacing.sm`
- `16` → `spacing.base`
- `24` → `spacing.lg`
- `32` → `spacing.xl`

---

## 🎨 Colors (Most Used)

### Backgrounds
- `colors.neutral.white` - Card/modal background
- `colors.neutral.light_gray` - Page background
- `colors.neutral.form_field` - Inactive input background

### Text
- `colors.text.primary` - Main text (#333)
- `colors.text.secondary` - Secondary text (#545F71)
- `colors.text.placeholder` - Placeholder text (#888)

### Accents
- `colors.primary.rosa_full` - Main CTA (#FFC4C4)
- `colors.secondary.mint` - Secondary CTA (#CFFFE5)
- `colors.secondary.blue` - Tertiary/outline (#759AAB)

### States
- `colors.states.error` - Error red (#ff6b6b)
- `colors.states.success` - Success green (#4CAF50)
- `colors.states.disabled` - Disabled gray (#CCCCCC)

---

## 🔤 Typography Sizes

| Use | Size | Token |
|-----|------|-------|
| **Body Text (min)** | 16px | `typography.sizes.body_large` ⭐ |
| Secondary text | 14px | `typography.sizes.body_medium` |
| Labels/buttons | 14px | `typography.sizes.label_large` |
| Small titles | 14px | `typography.sizes.title_small` |
| Medium titles | 16px | `typography.sizes.title_medium` |
| Large titles | 22px | `typography.sizes.title_large` |
| Section headings | 24px | `typography.sizes.heading_small` |

**Rule:** Never use text smaller than 16px for reading

---

## 🎯 Layout Pattern

```tsx
<View style={{ paddingHorizontal: spacing.base }}>
  {/* Section */}
  <View style={{ marginBottom: spacing.lg }}>
    <Text style={{ fontSize: typography.sizes.body_large }}>
      Content here
    </Text>
  </View>

  {/* Fields with spacing */}
  <Input label="Field 1" {...props} />
  <Input label="Field 2" {...props} />

  {/* Buttons with top margin */}
  <View style={{ marginTop: spacing.lg }}>
    <Button title="Submit" onPress={handleSubmit} />
  </View>
</View>
```

---

## ❌ NEVER DO

```tsx
// ❌ Hardcode spacing
marginTop: 13, padding: "5%", marginBottom: 24

// ❌ Hardcode colors
backgroundColor: '#FFC4C4', color: '#333333'

// ❌ Hardcode font sizes
fontSize: 14, fontFamily: 'Inter'

// ❌ Use text smaller than 16px for reading
<Text style={{ fontSize: 11 }}>Read this text</Text>

// ❌ Use old button/input components
import InputName from '@/components/Inputs/inputName';
import AddButton from '@/components/Buttons/AddButton';

// ❌ Arbitrary margin combinations
marginTop: 16, marginBottom: 16 (use padding instead)
```

---

## ✅ DO THIS

```tsx
// ✅ Use design tokens
marginTop: spacing.base, padding: spacing.lg

// ✅ Use color tokens
backgroundColor: colors.primary.rosa_full, color: colors.text.primary

// ✅ Use typography tokens
fontSize: typography.sizes.body_large,
fontFamily: typography.fonts.body

// ✅ 16px minimum for readable text
<Text style={{ fontSize: typography.sizes.body_large }}>
  This text is easy to read
</Text>

// ✅ Use new components
import Button from '@/components/Buttons/Button';
import Input from '@/components/Inputs/Input';

// ✅ Use parent spacing
<View style={{ paddingHorizontal: spacing.base }}>
  <Input ... />
</View>
```

---

## 🎬 Common Patterns

### Form Section
```tsx
<View style={{ marginBottom: spacing.lg }}>
  <Text style={{
    fontSize: typography.sizes.body_medium,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    color: colors.text.primary
  }}>
    Section Title
  </Text>
  <Input label="Field" {...props} />
</View>
```

### Button Group
```tsx
<View style={{ marginTop: spacing.lg, gap: spacing.base }}>
  <Button title="Primary" onPress={handlePrimary} variant="primary" />
  <Button title="Secondary" onPress={handleSecondary} variant="outline" />
</View>
```

### Container
```tsx
<View style={{
  paddingHorizontal: spacing.base,
  paddingVertical: spacing.lg,
  backgroundColor: colors.neutral.white,
  borderRadius: borderRadius.large
}}>
  {children}
</View>
```

---

## 📱 Component Variants at a Glance

### Button Variants

| Variant | Background | Use Case |
|---------|-----------|----------|
| **primary** | Rosa (#FFC4C4) | Main actions: Save, Submit |
| **secondary** | Mint (#CFFFE5) | Alternative: Next Step |
| **outline** | White + Blue border | Tertiary: Cancel, Back |

### Input Features

| Feature | Example |
|---------|---------|
| **Icon** | `icon="person"` |
| **Validation** | `isValid={isValid}` |
| **Error** | `errorMessage="Text"` |
| **Keyboard** | `keyboardType="email-address"` |
| **Secure** | `secureTextEntry={true}` |

---

## 🔗 Full Documentation

- **Design System:** `/src/theme/DESIGN_SYSTEM.md`
- **Migration Guide:** `/src/components/MIGRATION_GUIDE.md`
- **Example Screen:** `/src/theme/EXAMPLE_REFACTORED_SCREEN.tsx`
- **Tokens File:** `/src/theme/tokens.ts`

---

## 💡 Pro Tips

1. **Use design tokens in all styled components**
2. **Keep forms uncluttered** - use generous spacing
3. **Test text at 16px minimum** - you'll be surprised how readable it is
4. **Use button variants for hierarchy** - primary > secondary > outline
5. **Validate inputs early** - show errors inline as user types
6. **Test with accessibility tools** - tap targets, contrast, screen readers

---

## 🎯 Remember: CANDI is for cancer patients

- **Accessibility first** - vision, dexterity, cognitive load
- **Clarity over cleverness** - simple, obvious, reassuring
- **Generous spacing** - don't crowd the interface
- **Large readable text** - never smaller than 16px
- **Warm colors** - pink (#FFC4C4) is our primary brand
- **Consistent patterns** - users should know what to expect

Every design decision impacts vulnerable users. When in doubt, prioritize clarity and accessibility. ❤️
