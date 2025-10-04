import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { Modal, Portal, Button } from "react-native-paper";
import { AppTheme } from "../../theme"; 

interface VerificationModalProps {
  visible: boolean;
  email: string;
  onDismiss: () => void;
  onConfirm: (code: string) => void;
  onResend: () => void;
}
const maskEmail = (email: string) => {
  if (!email.includes("@")) return email;
  const [name, domain] = email.split("@");
  if (name.length <= 4) return `${"*".repeat(name.length)}@${domain}`;
  const maskedName = name.substring(0, 4) + "*".repeat(name.length - 4);
  return `${maskedName}@${domain}`;
};


const VerificationModal: React.FC<VerificationModalProps> = ({
  visible, email, onDismiss, onConfirm, onResend,
}) => {
  const OTP_LENGTH = 6;
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [countdown, setCountdown] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    if (visible && countdown > 0) {
      setIsResendDisabled(true);
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setIsResendDisabled(false);
    }
  }, [visible, countdown]);

  useEffect(() => {
    if (visible) {
      setCode(Array(OTP_LENGTH).fill(""));
      setCountdown(30);
      setIsResendDisabled(true);
      inputsRef.current[0]?.focus();
    }
  }, [visible]);

  const handleResend = () => {
    if (!isResendDisabled) {
      onResend();
      setCountdown(30);
      setIsResendDisabled(true);
    }
  };


  const handleChange = (text: string, index: number) => {
    const sanitizedText = text.replace(/[^0-9]/g, '');
    
    if (sanitizedText.length > 1) {
      const newCode = [...code];

      const charsToFill = sanitizedText.slice(0, OTP_LENGTH - index);
      let lastFilledIndex = index;

      charsToFill.split('').forEach((char, i) => {
        const targetIndex = index + i;
        if (targetIndex < OTP_LENGTH) {
          newCode[targetIndex] = char;
          lastFilledIndex = targetIndex;
        }
      });
      
      setCode(newCode);

      if (lastFilledIndex < OTP_LENGTH - 1) {
        inputsRef.current[lastFilledIndex + 1]?.focus();
      } else {
        inputsRef.current[lastFilledIndex]?.focus();
      }

    } else { 
      const newCode = [...code];
      newCode[index] = sanitizedText;
      setCode(newCode);

      if (sanitizedText && index < OTP_LENGTH - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };
  
  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const fullCode = code.join("");

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Verifique seu e-mail</Text>
          <Text style={styles.description}>
            Enviamos um código de seis dígitos para o seu e-mail{" "}
            <Text style={styles.emailText}>{maskEmail(email)}</Text>. Por favor,
            verifique sua caixa de entrada e a pasta de spam e insira abaixo o
            código recebido.
          </Text>
          <View style={styles.otpContainer}>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <TextInput
                key={index}
                ref={(el) => { inputsRef.current[index] = el; }}
                value={code[index]}
                onChangeText={(t) => handleChange(t, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                style={[
                  styles.input,
                  code[index] ? styles.inputFilled : styles.inputEmpty,
                  focusedIndex === index ? styles.inputFocused : {},
                ]}
                keyboardType="number-pad"
              />
            ))}
          </View>
          <TouchableOpacity onPress={handleResend} disabled={isResendDisabled}>
            <Text style={[ styles.resendText, isResendDisabled && styles.resendDisabled ]}>
              {isResendDisabled ? `Reenviar e-mail: ${countdown}s` : "Reenviar e-mail"}
            </Text>
          </TouchableOpacity>
          <Button
            mode="contained"
            onPress={() => onConfirm(fullCode)}
            disabled={fullCode.length < OTP_LENGTH}
            style={[ styles.button, fullCode.length < OTP_LENGTH && styles.disabledButton ]}
            labelStyle={styles.buttonText}
          >
            Verificar código
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};


const styles = StyleSheet.create({
    modalContainer: {
        justifyContent: "center", alignItems: "center", paddingHorizontal: 20,
    },
    contentWrapper: {
        backgroundColor: AppTheme.colors.cardBackground, borderRadius: 24, padding: 24, width: "100%", alignItems: "center",
        shadowColor: AppTheme.colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
    },
    title: {
        ...AppTheme.fonts.titleLarge, color: AppTheme.colors.nameText, marginBottom: 12,
    },
    description: {
        ...AppTheme.fonts.bodyMedium, color: AppTheme.colors.roleText, textAlign: "center", lineHeight: 21, marginBottom: 24,
    },
    emailText: {
        fontWeight: "bold", color: AppTheme.colors.textColor,
    },
    otpContainer: {
        flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 24,
    },
    input: {
        width: 48, height: 58, borderWidth: 1.5, borderRadius: 12, textAlign: "center",
        fontFamily: AppTheme.fonts.headlineSmall.fontFamily, fontSize: AppTheme.fonts.headlineSmall.fontSize,
        color: AppTheme.colors.textColor,
    },
    inputEmpty: {
        backgroundColor: AppTheme.colors.cardBackground, borderColor: AppTheme.colors.placeholderBackground,
    },
    inputFilled: {
        backgroundColor: `${AppTheme.colors.primary}40`, borderColor: AppTheme.colors.primary,
    },
    inputFocused: {
        borderColor: AppTheme.colors.primary, 
        borderWidth: 2,
    },
    resendText: {
        ...AppTheme.fonts.labelLarge, color: AppTheme.colors.tertiary, marginBottom: 24,
    },
    resendDisabled: {
        color: AppTheme.colors.placeholderText,
    },
    button: {
        width: "100%", paddingVertical: 8, backgroundColor: AppTheme.colors.tertiary,
        borderRadius: AppTheme.roundness,
    },
    buttonText: {
        color: AppTheme.colors.cardBackground, fontFamily: AppTheme.fonts.bodyLarge.fontFamily,
        fontWeight: AppTheme.fonts.titleMedium.fontWeight, fontSize: AppTheme.fonts.bodyLarge.fontSize,
    },
    disabledButton: {
        backgroundColor: AppTheme.colors.dotsColor,
    },
});

export default VerificationModal;