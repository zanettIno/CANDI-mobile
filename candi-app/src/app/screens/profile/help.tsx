import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppTheme } from '../../../theme';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const FAQS = [
  {
    q: 'Como adiciono alguém à minha Rede de Apoio?',
    a: 'Vá em Perfil → Rede de Apoio, insira o e-mail da pessoa e selecione o que ela pode visualizar. Ela receberá um convite por e-mail para criar a conta.',
  },
  {
    q: 'Minha rede de apoio pode editar meus dados?',
    a: 'Não. A Rede de Apoio tem acesso apenas para visualização das seções que você autorizar. Nenhuma edição é permitida.',
  },
  {
    q: 'Como registro minha agenda de consultas?',
    a: 'Acesse a aba "Agenda" na barra inferior e toque no botão "+" para adicionar consultas, medicamentos e sintomas.',
  },
  {
    q: 'O que são os Marcos do Tratamento?',
    a: 'São conquistas registradas ao longo do seu tratamento — como o término de um ciclo de quimioterapia, resultados positivos ou metas pessoais alcançadas.',
  },
  {
    q: 'Meus dados de saúde são seguros?',
    a: 'Sim. Todos os dados são criptografados e armazenados de forma segura na AWS. Apenas você e quem você autorizar têm acesso.',
  },
  {
    q: 'Como funciona o feed da Comunidade?',
    a: 'O feed é uma área exclusiva para pacientes oncológicos compartilharem experiências, conquistas e apoio mútuo. Posts inapropriados podem ser denunciados.',
  },
  {
    q: 'Posso usar o app sem internet?',
    a: 'Algumas informações ficam em cache, mas o app precisa de conexão para sincronizar dados, enviar mensagens e acessar o feed.',
  },
  {
    q: 'Como altero minha senha?',
    a: 'Acesse Perfil → botão "Editar" → a tela de edição permite alterar suas informações. Para senha, use a opção "Esqueci minha senha" na tela de login.',
  },
];

export default function Help() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);
  const scrollRef = useScrollToTopOnFocus();

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[s.header, { paddingTop: STATUS_TOP }]}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeProfile')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Ajuda</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={s.headerSub}>Como podemos ajudar?</Text>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Contato direto */}
        <View style={s.contactCard}>
          <View style={s.contactIcon}>
            <MaterialIcons name="support-agent" size={28} color={AppTheme.colors.tertiary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.contactTitle}>Fale com o suporte</Text>
            <Text style={s.contactSub}>contato@candi.app</Text>
          </View>
          <TouchableOpacity
            style={s.contactBtn}
            onPress={() => Linking.openURL('mailto:contato@candi.app')}
            activeOpacity={0.8}
          >
            <Text style={s.contactBtnText}>Enviar e-mail</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={s.faqTitle}>Perguntas frequentes</Text>

        {FAQS.map((faq, i) => (
          <TouchableOpacity
            key={i}
            style={[s.faqCard, expanded === i && s.faqCardOpen]}
            onPress={() => setExpanded(expanded === i ? null : i)}
            activeOpacity={0.8}
          >
            <View style={s.faqHeader}>
              <Text style={[s.faqQuestion, expanded === i && s.faqQuestionOpen]} numberOfLines={expanded === i ? 10 : 2}>
                {faq.q}
              </Text>
              <MaterialIcons
                name={expanded === i ? 'expand-less' : 'expand-more'}
                size={20}
                color={expanded === i ? AppTheme.colors.tertiary : AppTheme.colors.placeholderText}
              />
            </View>
            {expanded === i && (
              <Text style={s.faqAnswer}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        <Text style={s.footer}>Não encontrou o que procurava? Manda um e-mail para contato@candi.app</Text>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: {
    backgroundColor: AppTheme.colors.tertiary,
    paddingHorizontal: 20, paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 4, paddingTop: 8,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  headerSub: {
    textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.8)',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, paddingBottom: 14, zIndex: 1,
  },

  content: { padding: 16, paddingBottom: 40, gap: 10 },

  contactCard: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  contactIcon: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  contactTitle: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  contactSub: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginTop: 2 },
  contactBtn: {
    backgroundColor: AppTheme.colors.tertiary,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  contactBtnText: { fontSize: 12, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.labelMedium.fontFamily },

  faqTitle: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6,
    color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    marginTop: 4, paddingLeft: 2,
  },

  faqCard: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  faqCardOpen: { borderColor: AppTheme.colors.tertiary },
  faqHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  faqQuestion: {
    flex: 1, fontSize: 14, fontWeight: '600', color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily, lineHeight: 20,
  },
  faqQuestionOpen: { color: AppTheme.colors.tertiary },
  faqAnswer: {
    fontSize: 13.5, color: AppTheme.colors.textColor, lineHeight: 20,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: AppTheme.colors.dotsColor,
  },

  footer: {
    textAlign: 'center', fontSize: 12, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginTop: 8, lineHeight: 18,
  },
});
