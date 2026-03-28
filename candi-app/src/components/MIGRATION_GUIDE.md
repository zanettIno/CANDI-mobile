# Component Migration Guide

## Overview

The CANDI app is transitioning to a standardized, design-system-based component library. This guide helps you migrate existing code to use the new components.

---

## 🔄 Button Components Migration

### Old Components (Deprecated)

The following button components are now deprecated and should be replaced:

- ❌ `ButtonCustom.tsx` / `buttonCustom.tsx`
- ❌ `AddButton.tsx`
- ❌ `sendButton.tsx`
- ❌ `addContactButton.tsx`
- ❌ `RegisterMedicineButton.tsx`
- ❌ `RegisterSymptomButton.tsx`
- ❌ `addCheckpointButton.tsx`
- ❌ `AppointmentButton.tsx`
- ❌ `GoogleButton.tsx`

### New Component

All buttons should now use the single standardized component:

```tsx
import Button from '@/components/Buttons/Button';
```

### Migration Examples

#### Example 1: AddButton → Button

**Before:**
```tsx
import { AddButton } from '@/components/Buttons/AddButton';

<AddButton onPress={handleAdd} />
```

**After:**
```tsx
import Button from '@/components/Buttons/Button';

<Button
  title="Adicionar"
  onPress={handleAdd}
  variant="primary"
/>
```

#### Example 2: sendButton → Button

**Before:**
```tsx
import { sendButton } from '@/components/Buttons/sendButton';

<sendButton onPress={handleSend} isLoading={loading} />
```

**After:**
```tsx
import Button from '@/components/Buttons/Button';

<Button
  title="Enviar"
  onPress={handleSend}
  loading={loading}
  variant="primary"
/>
```

#### Example 3: Custom Button with Variant

**Before:**
```tsx
import ButtonCustom from '@/components/Buttons/buttonCustom';

<ButtonCustom
  title="Cancelar"
  onPress={handleCancel}
  variant="outline"
/>
```

**After:**
```tsx
import Button from '@/components/Buttons/Button';

<Button
  title="Cancelar"
  onPress={handleCancel}
  variant="outline"
/>
```

---

## 📝 Input Components Migration

### Old Components (Deprecated)

The following input components are now deprecated and should be replaced:

- ❌ `inputName.tsx`
- ❌ `inputEmail.tsx`
- ❌ `inputPassword.tsx`
- ❌ `inputPhone.tsx`
- ❌ `inputMessage.tsx`
- ❌ `inputSearch.tsx`
- ❌ `inputLocation.tsx`
- ❌ `inputTime.tsx`
- ❌ `inputBirth.tsx`
- ❌ `inputCode.tsx`
- ❌ All inputs in `FormInputMedicine/` directory
- ❌ All inputs in `FormInputSymptom/` directory

### New Component

All inputs should now use the single standardized component:

```tsx
import Input from '@/components/Inputs/Input';
```

### Migration Examples

#### Example 1: inputName → Input

**Before:**
```tsx
import InputName from '@/components/Inputs/inputName';

<InputName
  value={name}
  onChangeText={setName}
  placeholder="Nome"
/>
```

**After:**
```tsx
import Input from '@/components/Inputs/Input';

<Input
  label="Nome"
  value={name}
  onChangeText={setName}
  icon="person"
/>
```

#### Example 2: inputEmail → Input

**Before:**
```tsx
import InputEmail from '@/components/Inputs/inputEmail';

<InputEmail
  value={email}
  onChangeText={setEmail}
/>
```

**After:**
```tsx
import Input from '@/components/Inputs/Input';

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  icon="mail"
/>
```

#### Example 3: inputPassword → Input

**Before:**
```tsx
import InputPassword from '@/components/Inputs/inputPassword';

<InputPassword
  value={password}
  onChangeText={setPassword}
/>
```

**After:**
```tsx
import Input from '@/components/Inputs/Input';

<Input
  label="Senha"
  value={password}
  onChangeText={setPassword}
  secureTextEntry={true}
  icon="lock"
/>
```

#### Example 4: Input with Validation

**Before:**
```tsx
import InputPhone from '@/components/Inputs/inputPhone';

<InputPhone
  value={phone}
  onChangeText={handlePhoneChange}
/>
// Validation was embedded in the component
```

**After:**
```tsx
import Input from '@/components/Inputs/Input';

const isValidPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
};

<Input
  label="Telefone"
  value={phone}
  onChangeText={setPhone}
  keyboardType="phone-pad"
  icon="phone"
  isValid={phone ? isValidPhone(phone) : undefined}
  errorMessage={!isValidPhone(phone) ? "Telefone inválido" : undefined}
/>
```

---

## 🎨 Using Design Tokens

### Import Tokens

```tsx
import { spacing, colors, typography, borderRadius } from '@/theme/tokens';
```

### Replace Hardcoded Values

**Spacing:**
```tsx
// ❌ Before
<View style={{ padding: 16, marginBottom: 24 }}>

// ✅ After
<View style={{ padding: spacing.base, marginBottom: spacing.lg }}>
```

**Colors:**
```tsx
// ❌ Before
<View style={{ backgroundColor: '#FFC4C4' }}>
<Text style={{ color: '#333333' }}>

// ✅ After
<View style={{ backgroundColor: colors.primary.rosa_full }}>
<Text style={{ color: colors.text.primary }}>
```

**Typography:**
```tsx
// ❌ Before
<Text style={{ fontSize: 16, fontFamily: 'Inter_400Regular' }}>

// ✅ After
<Text style={{
  fontSize: typography.sizes.body_large,
  fontFamily: typography.fonts.body
}}>
```

**Border Radius:**
```tsx
// ❌ Before
<View style={{ borderRadius: 50 }}>

// ✅ After
<View style={{ borderRadius: borderRadius.full }}>
```

---

## 📋 Step-by-Step Migration Process

For each screen/component you're updating:

### 1. **Update Imports**
   ```tsx
   // Remove old component imports
   - import InputName from '@/components/Inputs/inputName';
   - import ButtonCustom from '@/components/Buttons/buttonCustom';

   // Add new imports
   + import Input from '@/components/Inputs/Input';
   + import Button from '@/components/Buttons/Button';
   + import { spacing, colors, typography } from '@/theme/tokens';
   ```

### 2. **Replace Button Components**
   - Find all button usage
   - Replace with `<Button>` component
   - Update props (title, onPress, variant)

### 3. **Replace Input Components**
   - Find all input usage
   - Replace with `<Input>` component
   - Update props (label, value, onChangeText, icon)
   - Move validation logic to parent component if needed

### 4. **Replace Hardcoded Spacing Values**
   - Find all `padding`, `margin`, `paddingHorizontal`, etc.
   - Replace with design tokens
   - Common replacements:
     - `8` → `spacing.sm`
     - `12` → `spacing.md`
     - `16` → `spacing.base`
     - `24` → `spacing.lg`
     - `32` → `spacing.xl`

### 5. **Replace Hardcoded Colors**
   - Find all hex color values
   - Replace with color tokens
   - Check `/src/theme/tokens.ts` for available colors

### 6. **Replace Hardcoded Font Sizes**
   - Find all `fontSize` values
   - Replace with `typography.sizes.*`
   - Ensure minimum 16px for body text

### 7. **Test & Verify**
   - Test the screen visually
   - Verify spacing looks correct
   - Check form validation works
   - Test with accessibility tools

---

## ✅ Checklist for Each Updated Component

- [ ] All old button components replaced with `Button`
- [ ] All old input components replaced with `Input`
- [ ] All spacing values use design tokens
- [ ] All colors use design tokens
- [ ] All font sizes use typography tokens
- [ ] Minimum font size is 16px for body text
- [ ] Form inputs have validation feedback
- [ ] Buttons are disabled when appropriate
- [ ] Component renders correctly on all screen sizes
- [ ] Accessibility is maintained or improved
- [ ] No hardcoded hex colors remaining
- [ ] No arbitrary margin/padding values remaining

---

## 🔍 Finding Components to Update

Use these grep commands to find files that need updating:

```bash
# Find old button imports
grep -r "from.*Buttons/Add\|from.*Buttons/send\|from.*buttonCustom" src/

# Find old input imports
grep -r "from.*Inputs/input" src/

# Find hardcoded spacing values
grep -r "margin.*px\|padding.*px" src/app/screens/ | grep -E "[0-9]{2}px"

# Find hex color values
grep -r "#[A-F0-9]\{6\}" src/ | grep -v "theme\|tokens"
```

---

## 📞 Questions?

If you have questions during migration:

1. **Check the Design System docs:** `/src/theme/DESIGN_SYSTEM.md`
2. **Review the example:** `/src/theme/EXAMPLE_REFACTORED_SCREEN.tsx`
3. **Check token definitions:** `/src/theme/tokens.ts`
4. **Review component props:** `/src/components/Buttons/Button.tsx`, `/src/components/Inputs/Input.tsx`

---

## 🎯 Priority Screens for Migration

Prioritize migrating these screens first (most commonly used):

1. `src/app/screens/(tabs)/home.tsx` - Main home screen
2. `src/app/screens/profile/contatosAdd.tsx` - Add contact form
3. `src/app/screens/agenda/compromissosAdd.tsx` - Add appointment form
4. `src/app/screens/diary/*` - Diary screens
5. `src/app/screens/community/*` - Community screens

---

## 📊 Migration Progress Tracking

Keep track of which files have been migrated:

- [ ] Home screen
- [ ] Profile screens
- [ ] Agenda screens
- [ ] Diary screens
- [ ] Community screens
- [ ] All deprecated button files removed
- [ ] All deprecated input files removed
- [ ] All design tokens in use
- [ ] All hardcoded values replaced
- [ ] Accessibility testing completed

---

## After Migration

Once migration is complete:

1. **Remove old component files** (after confirming no imports remain)
2. **Run tests** to ensure everything works
3. **Test with real users** for accessibility
4. **Update any internal documentation**
5. **Celebrate** 🎉 - You've standardized the design system!
