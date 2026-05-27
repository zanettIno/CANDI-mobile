import React from 'react';
import { View, Text, Image, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '../../theme/index';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface SharedPostNavParams {
  postId: string;
  authorName: string;
  content: string;
  fileUrl?: string;
  createdAt: string;
  profileId?: string;
  [key: string]: string | undefined;
}

interface MessageBubbleProps {
  message: string;
  time: string;
  isSent: boolean;
  msgStatus?: MessageStatus;
  onPressSharedPost?: (params: SharedPostNavParams) => void;
}

// ── Ícone de status (checkmarks) ───────────────────────────────────────────
const StatusIcon: React.FC<{ status: MessageStatus }> = ({ status }) => {
  if (status === 'sent') {
    return <MaterialIcons name="done" size={13} color="rgba(0,60,30,0.45)" />;
  }
  const color = status === 'read' ? '#29b6f6' : 'rgba(0,60,30,0.45)';
  return (
    <View style={si.wrap}>
      <MaterialIcons name="done" size={13} color={color} style={si.first} />
      <MaterialIcons name="done" size={13} color={color} />
    </View>
  );
};

const si = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  first: { marginRight: -7 },
});

// ── Shared post card ────────────────────────────────────────────────────────
interface SharedPost {
  post_id: string;
  author_name: string;
  content: string;
  file_url?: string | null;
  created_at: string;
  shared_by: string;
}

const SharedPostCard: React.FC<{ data: SharedPost; isSent: boolean }> = ({ data, isSent }) => {
  const [imgErr, setImgErr] = React.useState(false);
  const preview = data.content.length > 160 ? data.content.slice(0, 160) + '…' : data.content;
  const textCol = isSent ? '#1a3a2a' : AppTheme.colors.textColor;
  const dimCol = isSent ? 'rgba(0,60,30,0.6)' : AppTheme.colors.placeholderText;

  return (
    <View style={[sp.card, isSent ? sp.cardSent : sp.cardRecv]}>
      <View style={sp.header}>
        <MaterialIcons name="push-pin" size={11} color={dimCol} />
        <Text style={[sp.sharedBy, { color: dimCol }]}>{data.shared_by} compartilhou</Text>
      </View>
      <View style={[sp.divider, { backgroundColor: isSent ? 'rgba(0,60,30,0.15)' : AppTheme.colors.dotsColor }]} />
      <Text style={[sp.author, { color: textCol }]}>{data.author_name}</Text>
      {data.file_url && !imgErr && (
        Platform.OS === 'web' ? (
          <img src={data.file_url} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, marginBottom: 6 }}
            onError={() => setImgErr(true)} crossOrigin="anonymous" />
        ) : (
          <Image source={{ uri: data.file_url }} style={sp.img} resizeMode="cover" onError={() => setImgErr(true)} />
        )
      )}
      <Text style={[sp.content, { color: textCol }]}>{preview}</Text>
    </View>
  );
};

const sp = StyleSheet.create({
  card: { borderRadius: 10, padding: 10, marginBottom: 2 },
  cardSent: { backgroundColor: 'rgba(0,80,40,0.08)', borderWidth: 1, borderColor: 'rgba(0,80,40,0.12)' },
  cardRecv: { backgroundColor: AppTheme.colors.background, borderWidth: 1, borderColor: AppTheme.colors.dotsColor },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 },
  sharedBy: { fontSize: 11, fontFamily: AppTheme.fonts.labelSmall.fontFamily, fontWeight: '600' },
  divider: { height: 1, marginBottom: 7 },
  author: { fontSize: 13, fontWeight: '700', fontFamily: AppTheme.fonts.bodyMedium.fontFamily, marginBottom: 4 },
  img: { width: '100%', height: 110, borderRadius: 8, marginBottom: 6 },
  content: { fontSize: 13, fontFamily: AppTheme.fonts.bodyMedium.fontFamily, lineHeight: 18 },
});

// ── Bubble principal ────────────────────────────────────────────────────────
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message, time, isSent, msgStatus, onPressSharedPost,
}) => {
  const sentBg = '#d4f0e0';
  const recvBg = AppTheme.colors.cardBackground;
  const sentText = '#0d2d1a';
  const recvText = AppTheme.colors.textColor;
  const timeCol = isSent ? 'rgba(0,60,30,0.45)' : AppTheme.colors.placeholderText;

  // Shared post
  if (message.startsWith('__POST__:')) {
    let post: SharedPost | null = null;
    try { post = JSON.parse(message.slice('__POST__:'.length)); } catch {}
    if (post) {
      return (
        <TouchableOpacity
          activeOpacity={onPressSharedPost ? 0.75 : 1}
          onPress={onPressSharedPost ? () => onPressSharedPost({
            postId: post!.post_id, authorName: post!.author_name,
            content: post!.content, fileUrl: post!.file_url ?? undefined,
            createdAt: post!.created_at,
          }) : undefined}
        >
          <View style={[s.bubble, isSent ? [s.sent, s.sentTail] : [s.recv, s.recvTail],
            { backgroundColor: isSent ? sentBg : recvBg }]}>
            <SharedPostCard data={post!} isSent={isSent} />
            <View style={s.foot}>
              <Text style={[s.time, { color: timeCol }]}>{time}</Text>
              {msgStatus && <StatusIcon status={msgStatus} />}
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  }

  return (
    <View style={[
      s.bubble,
      isSent ? [s.sent, s.sentTail] : [s.recv, s.recvTail],
      { backgroundColor: isSent ? sentBg : recvBg },
    ]}>
      <Text style={[s.text, { color: isSent ? sentText : recvText }]}>{message}</Text>
      <View style={s.foot}>
        <Text style={[s.time, { color: timeCol }]}>{time}</Text>
        {msgStatus && <StatusIcon status={msgStatus} />}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  bubble: {
    paddingHorizontal: 11,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 18,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  sent: { borderBottomRightRadius: 4 },
  sentTail: {},
  recv: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: AppTheme.colors.dotsColor,
  },
  recvTail: {},
  text: {
    fontSize: 14.5,
    lineHeight: 20,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    marginBottom: 2,
  },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 1,
  },
  time: {
    fontSize: 10.5,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },
});

export default MessageBubble;
