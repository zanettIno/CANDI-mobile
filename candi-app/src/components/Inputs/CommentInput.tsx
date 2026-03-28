/**
 * Comment Input Component
 *
 * Input field for adding comments to posts.
 * Follows CANDI design system with accessibility first.
 *
 * Features:
 * - Accessible: 48x48px minimum touch target
 * - Real-time validation
 * - Loading state
 * - Error handling
 * - Uses design tokens
 */

import React, { useState } from 'react';
import { TextInput, View, ActivityIndicator, Platform } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '@/components/Buttons/Button';
import { spacing, colors, typography, borderRadius } from '@/theme/tokens';

interface CommentInputProps {
  /** Callback when comment is submitted */
  onSubmit: (content: string) => Promise<void>;

  /** Disable input (e.g., while loading) */
  disabled?: boolean;

  /** Placeholder text */
  placeholder?: string;

  /** Maximum character count */
  maxLength?: number;

  /** Custom styles */
  style?: any;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled(View)`
  flex-direction: row;
  align-items: flex-end;
  gap: ${spacing.sm}px;
  padding-horizontal: ${spacing.base}px;
  padding-vertical: ${spacing.md}px;
  background-color: ${colors.neutral.white};
  border-top-width: 1px;
  border-top-color: ${colors.neutral.gray};
`;

const InputWrapper = styled(View)`
  flex: 1;
  min-height: 48px;
`;

interface StyledTextInputProps {
  $disabled?: boolean;
}

const StyledTextInput = styled(TextInput)<StyledTextInputProps>`
  background-color: ${colors.neutral.form_field};
  border-radius: ${borderRadius.full}px;
  padding-left: ${spacing.base}px;
  padding-right: ${spacing.base}px;
  padding-vertical: ${spacing.sm}px;

  font-size: ${typography.sizes.body_large}px;
  font-family: ${typography.fonts.body};
  font-weight: ${typography.weights.regular};
  color: ${colors.text.primary};

  max-height: 100px;
  min-height: 48px;

  opacity: ${props => (props.$disabled ? 0.6 : 1)};
`;

const CharCountText = styled.Text`
  font-size: ${typography.sizes.label_medium}px;
  color: ${colors.text.secondary};
  margin-horizontal: ${spacing.sm}px;
`;

const LoadingContainer = styled(View)`
  justify-content: center;
  align-items: center;
  width: 56px;
  height: 56px;
`;

// ============================================================================
// COMPONENT
// ============================================================================

const CommentInput = React.forwardRef<TextInput, CommentInputProps>(
  (
    {
      onSubmit,
      disabled = false,
      placeholder = 'Adicione um comentário...',
      maxLength = 500,
      style,
    },
    ref
  ) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const charCount = content.length;
    const isValid = content.trim().length > 0 && charCount <= maxLength;
    const isDisabled = disabled || isLoading || !isValid;

    const handleSubmit = async () => {
      if (!isValid) return;

      setIsLoading(true);
      try {
        await onSubmit(content.trim());
        setContent(''); // Clear input after successful submission
      } catch (error) {
        console.error('Error submitting comment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Container style={style}>
        <InputWrapper>
          <StyledTextInput
            ref={ref}
            value={content}
            onChangeText={setContent}
            placeholder={placeholder}
            placeholderTextColor={colors.text.placeholder}
            multiline={true}
            maxLength={maxLength}
            editable={!disabled && !isLoading}
            $disabled={disabled || isLoading}
            accessibilityLabel="Comment input"
            accessibilityHint="Write a comment and tap send"
            accessibilityRole="search"
          />

          {maxLength && charCount > maxLength * 0.8 && (
            <CharCountText>
              {charCount}/{maxLength}
            </CharCountText>
          )}
        </InputWrapper>

        {isLoading ? (
          <LoadingContainer>
            <ActivityIndicator size="small" color={colors.primary.rosa_full} />
          </LoadingContainer>
        ) : (
          <Button
            title="Enviar"
            onPress={handleSubmit}
            disabled={isDisabled}
            variant="primary"
            style={{
              minWidth: 56,
              minHeight: 56,
              borderRadius: 28,
              paddingHorizontal: spacing.base,
            }}
          />
        )}
      </Container>
    );
  }
);

CommentInput.displayName = 'CommentInput';

export default CommentInput;
