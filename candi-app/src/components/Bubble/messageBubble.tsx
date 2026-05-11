import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { AppTheme } from '../../theme/index';
import { MaterialIcons } from '@expo/vector-icons';

interface MessageBubbleProps {
  message: string;
  time: string;
  isSent: boolean;
}

interface SharedPost {
  post_id: string;
  author_name: string;
  content: string;
  file_url?: string | null;
  created_at: string;
  shared_by: string;
}

const SharedPostCard: React.FC<{ data: SharedPost; isSent: boolean }> = ({ data, isSent }) => {
  const [imgError, setImgError] = React.useState(false);
  const preview = data.content.length > 180 ? data.content.slice(0, 180) + '...' : data.content;

  return (
    <View style={[sharedStyles.card, isSent ? sharedStyles.cardSent : sharedStyles.cardReceived]}>
      {/* Cabeçalho "X compartilhou" */}
      <View style={sharedStyles.sharedByRow}>
        <MaterialIcons name="push-pin" size={12} color={isSent ? 'rgba(255,255,255,0.7)' : AppTheme.colors.tertiary} />
        <Text style={[sharedStyles.sharedByText, isSent && sharedStyles.sharedByTextSent]}>
          {data.shared_by} compartilhou
        </Text>
      </View>

      {/* Divider */}
      <View style={[sharedStyles.divider, isSent && sharedStyles.dividerSent]} />

      {/* Autor */}
      <Text style={[sharedStyles.authorName, isSent && sharedStyles.textSent]}>{data.author_name}</Text>

      {/* Imagem do post */}
      {data.file_url && !imgError && (
        Platform.OS === 'web' ? (
          <img
            src={data.file_url}
            style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, marginBottom: 6 }}
            onError={() => setImgError(true)}
            crossOrigin="anonymous"
          />
        ) : (
          <Image
            source={{ uri: data.file_url }}
            style={sharedStyles.postImage}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        )
      )}

      {/* Conteúdo do post */}
      <Text style={[sharedStyles.postContent, isSent && sharedStyles.textSent]}>{preview}</Text>
    </View>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, time, isSent }) => {
  // Detecta mensagem de post compartilhado
  if (message.startsWith('__POST__:')) {
    let sharedPost: SharedPost | null = null;
    try {
      sharedPost = JSON.parse(message.slice('__POST__:'.length));
    } catch {}

    if (sharedPost) {
      return (
        <View style={[styles.container, isSent ? styles.containerSent : styles.containerReceived]}>
          <View style={[styles.bubble, isSent ? styles.bubbleSent : styles.bubbleReceived, styles.bubbleShared]}>
            <SharedPostCard data={sharedPost} isSent={isSent} />
            <Text style={[styles.time, isSent ? styles.timeSent : styles.timeReceived]}>{time}</Text>
          </View>
        </View>
      );
    }
  }

  return (
    <View style={[styles.container, isSent ? styles.containerSent : styles.containerReceived]}>
      <View style={[styles.bubble, isSent ? styles.bubbleSent : styles.bubbleReceived]}>
        <Text style={[styles.message, isSent ? styles.messageSent : styles.messageReceived]}>
          {message}
        </Text>
        <Text style={[styles.time, isSent ? styles.timeSent : styles.timeReceived]}>
          {time}
        </Text>
      </View>
    </View>
  );
};

const sharedStyles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  cardSent: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  cardReceived: {
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1,
    borderColor: AppTheme.colors.dotsColor,
  },
  sharedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  sharedByText: {
    fontSize: 11,
    color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    fontWeight: '600',
  },
  sharedByTextSent: {
    color: 'rgba(255,255,255,0.75)',
  },
  divider: {
    height: 1,
    backgroundColor: AppTheme.colors.dotsColor,
    marginBottom: 8,
  },
  dividerSent: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    marginBottom: 4,
  },
  postImage: {
    width: '100%',
    height: 130,
    borderRadius: 8,
    marginBottom: 6,
  },
  postContent: {
    fontSize: 13,
    color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    lineHeight: 19,
  },
  textSent: {
    color: 'rgba(255,255,255,0.9)',
  },
});

const styles = StyleSheet.create({
  container: {
    maxWidth: '82%',
    marginVertical: 3,
  },
  containerSent: {
    alignSelf: 'flex-end',
  },
  containerReceived: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleShared: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  bubbleSent: {
    backgroundColor: AppTheme.colors.tertiary,
    borderTopRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: AppTheme.colors.dotsColor,
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 4,
  },
  messageSent: {
    color: AppTheme.colors.cardBackground,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
  },
  messageReceived: {
    color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
  },
  time: {
    fontSize: 11,
    alignSelf: 'flex-end',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },
  timeSent: {
    color: 'rgba(255,255,255,0.7)',
  },
  timeReceived: {
    color: AppTheme.colors.placeholderText,
  },
});

export default MessageBubble;
