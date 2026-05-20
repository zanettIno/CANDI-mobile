import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppTheme } from '../../../theme';
import LoginSignupBackground from '../../../components/LoginSignupBackground';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const TEAM = [
  { role: 'Produto & Design', color: AppTheme.colors.primary },
  { role: 'Engenharia', color: AppTheme.colors.secondary },
  { role: 'Dados & Saúde', color: '#c4d4ff' },
];

export default function About() {
  const router = useRouter();

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerBg}><LoginSignupBackground /></View>
        <View style={[s.headerRow, { paddingTop: STATUS_TOP + 8 }]}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeProfile')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Sobre o CANDI</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Logo + nome */}
        <View style={s.logoSection}>
          <Image
            source={require('../../../../assets/images/original.png')}
            style={s.logo}
            resizeMode="contain"
          />
          <Text style={s.appName}>CANDI</Text>
          <Text style={s.appTagline}>Comunidade de Apoio ao Paciente Oncológico</Text>
          <View style={s.versionPill}>
            <Text style={s.versionText}>Versão 1.0.0</Text>
          </View>
        </View>

        {/* Missão */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <MaterialIcons name="favorite" size={20} color={AppTheme.colors.primary} />
            <Text style={s.cardTitle}>Nossa missão</Text>
          </View>
          <Text style={s.cardText}>
            O CANDI nasceu para conectar pacientes oncológicos com sua rede de apoio,
            tornando o tratamento menos solitário. Acreditamos que informação, conexão
            e acompanhamento fazem parte da cura.
          </Text>
        </View>

        {/* O que oferecemos */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <MaterialIcons name="stars" size={20} color="#f59e0b" />
            <Text style={s.cardTitle}>O que oferecemos</Text>
          </View>
          {[
            { icon: 'people', text: 'Comunidade exclusiva para pacientes oncológicos' },
            { icon: 'event', text: 'Gestão da agenda de consultas e medicamentos' },
            { icon: 'book', text: 'Diário de saúde para registrar sua jornada' },
            { icon: 'flag', text: 'Marcos do tratamento para celebrar cada vitória' },
            { icon: 'group-add', text: 'Rede de apoio para familiares e cuidadores' },
          ].map((item, i) => (
            <View key={i} style={s.featureRow}>
              <View style={s.featureIcon}>
                <MaterialIcons name={item.icon as any} size={16} color={AppTheme.colors.tertiary} />
              </View>
              <Text style={s.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Privacidade */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <MaterialIcons name="lock" size={20} color={AppTheme.colors.tertiary} />
            <Text style={s.cardTitle}>Privacidade & Segurança</Text>
          </View>
          <Text style={s.cardText}>
            Seus dados de saúde são tratados com máxima confidencialidade.
            Você controla quem pode ver suas informações e pode revogar
            acessos a qualquer momento.
          </Text>
        </View>

        {/* Contato */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <MaterialIcons name="email" size={20} color="#8b5cf6" />
            <Text style={s.cardTitle}>Fale conosco</Text>
          </View>
          <Text style={s.contactEmail}>contato@candi.app</Text>
        </View>

        {/* Rodapé */}
        <Text style={s.footer}>
          © 2026 CANDI. Feito com cuidado para quem enfrenta o câncer.
        </Text>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: { position: 'relative' },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, zIndex: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },

  content: { padding: 16, paddingBottom: 40, gap: 12 },

  logoSection: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  logo: { width: 160, height: 50 },
  appName: {
    fontSize: 32, fontWeight: '800', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily, letterSpacing: 2,
  },
  appTagline: {
    fontSize: 13, color: AppTheme.colors.placeholderText, textAlign: 'center',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, maxWidth: 260, lineHeight: 18,
  },
  versionPill: {
    backgroundColor: AppTheme.colors.secondary, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 5, marginTop: 4,
  },
  versionText: { fontSize: 12, fontWeight: '600', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelMedium.fontFamily },

  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  cardText: {
    fontSize: 13.5, color: AppTheme.colors.textColor, lineHeight: 20,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },

  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { flex: 1, fontSize: 13, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodySmall.fontFamily },

  contactEmail: {
    fontSize: 15, fontWeight: '600', color: '#8b5cf6',
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },

  footer: {
    textAlign: 'center', fontSize: 12, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginTop: 8,
  },
});
