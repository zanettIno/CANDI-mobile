import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  Alert, Platform, Modal, TextInput, ActivityIndicator,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';
import Avatar from '@/components/Avatar';
import { formatRelativeDate } from '@/utils/dateFormat';
import { toggleLike, toggleFavorite, getComments, addComment, deleteComment } from '@/services/communityService';
import SharePostModal from '@/components/Modals/SharePostModal';
import { useProfile } from '@/context/ProfileContext';

const S3_BASE = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

// ── Imagem do post com fallback ──────────────────────────────────────────────
const PostImage: React.FC<{ uri: string }> = ({ uri }) => {
  const [error, setError] = useState(false);
  if (error) return null;
  // Encode spaces and special chars in filename part of URL
  const safeUri = uri.replace(/([^:/?#]+)$/, (match) => encodeURIComponent(decodeURIComponent(match)));
  if (Platform.OS === 'web') {
    return (
      <img
        src={safeUri}
        style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }}
        onError={() => setError(true)}
        crossOrigin="anonymous"
      />
    );
  }
  return (
    <Image
      source={{ uri: safeUri }}
      style={styles.postImage}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
};

// ── Tipos ────────────────────────────────────────────────────────────────────
interface Comment {
  comment_id: string;
  profile_id: string;
  author_name: string;
  text: string;
  created_at: string;
}

interface PostCardViewProps {
  postId: string;
  userName: string;
  userHandle: string;
  timeAgo: string;
  content: string;
  fileUrl?: string;
  profileId?: string;
  initialLikeCount?: number;
  initialCommentCount?: number;
  initialLiked?: boolean;
  initialFavorited?: boolean;
  onLikeToggle?: (postId: string, liked: boolean) => void;
  onFavoriteToggle?: (postId: string, favorited: boolean) => void;
}

// ── Componente ───────────────────────────────────────────────────────────────
export const PostCardView: React.FC<PostCardViewProps> = ({
  postId, userName, userHandle, timeAgo, content, fileUrl, profileId,
  initialLikeCount = 0, initialCommentCount = 0,
  initialLiked = false, initialFavorited = false,
  onLikeToggle, onFavoriteToggle,
}) => {
  const { profileId: myProfileId } = useProfile();

  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  // Sincroniza quando o pai recarrega os dados (volta ao feed)
  const [prevInitialLiked, setPrevInitialLiked] = useState(initialLiked);
  const [prevInitialFavorited, setPrevInitialFavorited] = useState(initialFavorited);
  const [prevInitialLikeCount, setPrevInitialLikeCount] = useState(initialLikeCount);
  if (initialLiked !== prevInitialLiked) { setPrevInitialLiked(initialLiked); setLiked(initialLiked); }
  if (initialFavorited !== prevInitialFavorited) { setPrevInitialFavorited(initialFavorited); setFavorited(initialFavorited); }
  if (initialLikeCount !== prevInitialLikeCount) { setPrevInitialLikeCount(initialLikeCount); setLikeCount(initialLikeCount); }
  const [likePending, setLikePending] = useState(false);
  const [favPending, setFavPending] = useState(false);

  const [shareVisible, setShareVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const isOwner = myProfileId && profileId && myProfileId === profileId;
  const avatarUri = profileId ? `${S3_BASE}/${profileId}.jpg` : undefined;

  // ── Like ────────────────────────────────────────────────────────────────────
  const handleLike = useCallback(async () => {
    if (likePending) return;
    setLikePending(true);
    const wasLiked = liked;
    const newLiked = !wasLiked;
    setLiked(newLiked);
    setLikeCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);
    try {
      const res = await toggleLike(postId);
      // Usa o count real retornado pelo servidor
      if (typeof res?.like_count === 'number') setLikeCount(res.like_count);
      onLikeToggle?.(postId, newLiked);
    } catch {
      setLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
      Alert.alert('Erro', 'Não foi possível registrar o like.');
    } finally {
      setLikePending(false);
    }
  }, [postId, liked, likePending, onLikeToggle]);

  // ── Favoritar ───────────────────────────────────────────────────────────────
  const handleFavorite = useCallback(async () => {
    if (favPending) return;
    setFavPending(true);
    const wasFav = favorited;
    const newFav = !wasFav;
    setFavorited(newFav);
    try {
      await toggleFavorite(postId);
      onFavoriteToggle?.(postId, newFav);
    } catch {
      setFavorited(wasFav);
      Alert.alert('Erro', 'Não foi possível salvar o post.');
    } finally {
      setFavPending(false);
    }
  }, [postId, favorited, favPending, onFavoriteToggle]);

  // ── Menu 3 pontinhos ────────────────────────────────────────────────────────
  const handleMenuAction = (action: 'report' | 'delete' | 'copy') => {
    setMenuVisible(false);
    if (action === 'copy') {
      if (Platform.OS === 'web' && navigator.clipboard) {
        navigator.clipboard.writeText(content);
        Alert.alert('Copiado!', 'Texto copiado para a área de transferência.');
      } else {
        Alert.alert('Texto', content);
      }
    } else if (action === 'report') {
      Alert.alert('Denúncia enviada', 'Agradecemos por manter a comunidade segura.');
    } else if (action === 'delete') {
      Alert.alert('Excluir postagem', 'Esta ação não pode ser desfeita.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => Alert.alert('Funcionalidade em breve') },
      ]);
    }
  };

  // ── Comentários ─────────────────────────────────────────────────────────────
  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const data = await getComments(postId);
      setComments(data);
      setCommentsLoaded(true);
    } catch {
      // silently fail — comments just won't show
    } finally {
      setCommentsLoading(false);
    }
  }, [postId]);

  const handleToggleComments = useCallback(() => {
    setCommentsVisible(v => {
      if (!v && !commentsLoaded) loadComments();
      return !v;
    });
  }, [commentsLoaded, loadComments]);

  const handleSendComment = useCallback(async () => {
    const text = commentText.trim();
    if (!text || sendingComment) return;
    setSendingComment(true);
    setCommentText('');
    try {
      const newComment = await addComment(postId, text);
      setComments(prev => [...prev, newComment]);
      setCommentCount(prev => prev + 1);
    } catch {
      setCommentText(text);
      Alert.alert('Erro', 'Não foi possível enviar o comentário.');
    } finally {
      setSendingComment(false);
    }
  }, [postId, commentText, sendingComment]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      await deleteComment(postId, commentId);
      setComments(prev => prev.filter(c => c.comment_id !== commentId));
      setCommentCount(prev => Math.max(0, prev - 1));
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir o comentário.');
    }
  }, [postId]);

  return (
    <>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Avatar uri={avatarUri} name={userName} size={42} />
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
            <Text style={styles.userMeta}>@{userHandle} · {formatRelativeDate(timeAgo)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            hitSlop={HIT_SLOP}
            activeOpacity={0.6}
          >
            <MaterialIcons name="more-vert" size={22} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <Text style={styles.content}>{content}</Text>

        {/* Imagem */}
        {fileUrl && <PostImage uri={fileUrl} />}

        {/* Ações */}
        <View style={styles.actions}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity onPress={handleLike} hitSlop={HIT_SLOP} activeOpacity={0.7}
              style={styles.actionBtn} disabled={likePending}>
              <MaterialIcons
                name={liked ? 'favorite' : 'favorite-border'} size={22}
                color={liked ? '#e05c72' : AppTheme.colors.placeholderText}
              />
              {likeCount > 0 && (
                <Text style={[styles.actionCount, liked && styles.likeCountActive]}>{likeCount}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleToggleComments}
              hitSlop={HIT_SLOP} activeOpacity={0.7} style={styles.actionBtn}
            >
              <MaterialIcons
                name={commentsVisible ? 'chat-bubble' : 'chat-bubble-outline'} size={22}
                color={commentsVisible ? AppTheme.colors.tertiary : AppTheme.colors.placeholderText}
              />
              {commentCount > 0 && (
                <Text style={styles.actionCount}>{commentCount}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShareVisible(true)} hitSlop={HIT_SLOP}
              activeOpacity={0.7} style={styles.actionBtn}>
              <MaterialIcons name="share" size={22} color={AppTheme.colors.placeholderText} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleFavorite} hitSlop={HIT_SLOP} activeOpacity={0.7}
            disabled={favPending}>
            <MaterialIcons
              name={favorited ? 'bookmark' : 'bookmark-border'} size={22}
              color={favorited ? AppTheme.colors.tertiary : AppTheme.colors.placeholderText}
            />
          </TouchableOpacity>
        </View>

        {/* Seção de comentários inline */}
        {commentsVisible && (
          <View style={styles.commentsSection}>
            {commentsLoading ? (
              <ActivityIndicator size="small" color={AppTheme.colors.tertiary} style={{ marginVertical: 8 }} />
            ) : comments.length === 0 ? (
              <Text style={styles.noComments}>Seja o primeiro a comentar.</Text>
            ) : (
              comments.map(c => (
                <View key={c.comment_id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{c.author_name}</Text>
                    {c.profile_id === myProfileId && (
                      <TouchableOpacity onPress={() => handleDeleteComment(c.comment_id)} hitSlop={HIT_SLOP} activeOpacity={0.7}>
                        <MaterialIcons name="delete-outline" size={14} color={AppTheme.colors.placeholderText} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              ))
            )}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Escreva um comentário..."
                placeholderTextColor={AppTheme.colors.placeholderText}
                value={commentText}
                onChangeText={setCommentText}
                onSubmitEditing={handleSendComment}
                returnKeyType="send"
                multiline={false}
                editable={!sendingComment}
              />
              <TouchableOpacity
                onPress={handleSendComment}
                disabled={!commentText.trim() || sendingComment}
                hitSlop={HIT_SLOP}
                activeOpacity={0.7}
                style={styles.commentSendBtn}
              >
                <MaterialIcons
                  name="send"
                  size={20}
                  color={commentText.trim() && !sendingComment ? AppTheme.colors.tertiary : AppTheme.colors.placeholderText}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Share modal */}
      <SharePostModal
        visible={shareVisible}
        postId={postId}
        postContent={content}
        onDismiss={() => setShareVisible(false)}
      />

      {/* Menu 3 pontinhos */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuSheet}>
            <View style={styles.menuHandle} />
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('copy')} activeOpacity={0.7}>
              <MaterialIcons name="content-copy" size={20} color={AppTheme.colors.textColor} />
              <Text style={styles.menuItemText}>Copiar texto</Text>
            </TouchableOpacity>
            {isOwner && (
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('delete')} activeOpacity={0.7}>
                <MaterialIcons name="delete-outline" size={20} color="#e05c72" />
                <Text style={[styles.menuItemText, { color: '#e05c72' }]}>Excluir postagem</Text>
              </TouchableOpacity>
            )}
            {!isOwner && (
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('report')} activeOpacity={0.7}>
                <MaterialIcons name="flag" size={20} color={AppTheme.colors.placeholderText} />
                <Text style={styles.menuItemText}>Denunciar</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.dotsColor,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userDetails: { flex: 1, marginLeft: 10 },
  userName: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontWeight: '600', color: AppTheme.colors.nameText,
  },
  userMeta: {
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    fontSize: AppTheme.fonts.bodySmall.fontSize,
    color: AppTheme.colors.placeholderText, marginTop: 1,
  },
  content: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.textColor, lineHeight: 22, marginBottom: 12,
  },
  postImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 12 },
  actions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: AppTheme.colors.dotsColor, paddingTop: 10,
  },
  actionsLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4,
    gap: 4, minWidth: 44, minHeight: 44, justifyContent: 'center',
  },
  actionCount: {
    fontSize: 13, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },
  likeCountActive: { color: '#e05c72', fontWeight: '600' },

  // Comments
  commentsSection: {
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: AppTheme.colors.dotsColor,
  },
  noComments: {
    fontSize: 13, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    textAlign: 'center', paddingVertical: 8,
  },
  commentItem: { marginBottom: 10 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  commentAuthor: {
    fontSize: 13, fontWeight: '600', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },
  commentText: {
    fontSize: 13, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, lineHeight: 18,
  },
  commentInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppTheme.colors.background,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    marginTop: 8, gap: 8,
  },
  commentInput: {
    flex: 1, fontSize: 13,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    color: AppTheme.colors.textColor, minHeight: 32,
  },
  commentSendBtn: { padding: 4 },

  // Menu
  menuOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12,
  },
  menuHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: AppTheme.colors.dotsColor,
    alignSelf: 'center', marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  menuItemText: {
    fontSize: 15, fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    color: AppTheme.colors.textColor, fontWeight: '500',
  },
});

export default PostCardView;
