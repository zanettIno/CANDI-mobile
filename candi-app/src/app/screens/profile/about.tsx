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

const FEATURES = [
  { icon: 'people', text: 'Comunidade exclusiva para pacientes oncológicos' },
  { icon: 'event', text: 'Gestão da agenda de consultas e medicamentos' },
  { icon: 'book', text: 'Diário de saúde para registrar sua jornada' },
  { icon: 'flag', text: 'Marcos do tratamento para celebrar cada vitória' },
  { icon: 'group-add', text: 'Rede de apoio para familiares e cuidadores' },
];

export default function About() {
  const router = useRouter();

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header com ondas naturais */}
      <View style={s.header}>
        <View style={s.headerWaves}><LoginSignupBackground /></View>
        <View style={[s.headerRow, { paddingTop: STATUS_TOP + 8 }]}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeProfile')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="arrow-back" size={24} color={AppTheme.colors.nameText} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Sobre o CANDI</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Logo na área de ondas */}
        <View style={s.logoWrap}>
          <Image
            source={require('../../../../assets/images/original.png')}
            style={s.logo}
            resizeMode="contain"
          />
          <View style={s.versionPill}>
            <Text style={s.versionText}>Versão 1.0.0</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Missão */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <View style={s.cardIconWrap}>
              <MaterialIcons name="favorite" size={18} color={AppTheme.colors.tertiary} />
            </View>
            <Text style={s.cardTitle}>Nossa missão</Text>
          </View>
          <Text style={s.cardText}>
            O CANDI nasceu para conectar pacientes oncológicos com sua rede de apoio,
            tornando o tratamento menos solitário. Acreditamos que informação, conexão
            e acompanhamento fazem parte da cura.
          </Text>
        </View>

        {/* Funcionalidades */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <View style={s.cardIconWrap}>
              <MaterialIcons name="stars" size={18} color={AppTheme.colors.tertiary} />
            </View>
            <Text style={s.cardTitle}>O que oferecemos</Text>
          </View>
          {FEATURES.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <View style={s.featureIcon}>
                <MaterialIcons name={f.icon as any} size={16} color={AppTheme.colors.tertiary} />
              </View>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Privacidade */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <View style={s.cardIconWrap}>
              <MaterialIcons name="lock" size={18} color={AppTheme.colors.tertiary} />
            </View>
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
          <View style={s.cardTitleRow}>
            <View style={s.cardIconWrap}>
              <MaterialIcons name="email" size={18} color={AppTheme.colors.tertiary} />
            </View>
            <Text style={s.cardTitle}>Fale conosco</Text>
          </View>
          <Text style={s.contactEmail}>contato@candi.app</Text>
        </View>

        <Text style={s.footer}>
          © 2026 CANDI. Feito com cuidado para quem enfrenta o câncer.
        </Text>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },

  header: { position: 'relative', height: 220 },
  headerWaves: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 4, zIndex: 2,
  },
  headerTitle: {
    fontSize: 17, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },

  logoWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 2,
  },
  logo: { width: 140, height: 44 },
  versionPill: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  versionText: {
    fontSize: 12, fontWeight: '600', color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },

  content: { padding: 16, paddingBottom: 40, gap: 12 },

  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIconWrap: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },
  cardText: {
    fontSize: 13.5, color: AppTheme.colors.textColor, lineHeight: 21,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },

  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1, fontSize: 13.5, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, lineHeight: 19,
  },

  contactEmail: {
    fontSize: 15, fontWeight: '600', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },

  footer: {
    textAlign: 'center', fontSize: 12, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginTop: 4, lineHeight: 18,
  },
});
