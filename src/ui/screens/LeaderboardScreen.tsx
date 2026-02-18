import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { colors, spacing, typography } from '../../theme';
import { LabelButton } from '../components/base/LabelButton.tsx';
import { fetchLeaderboard, LeaderboardEntry } from '../../services/supabase.ts';
import { GameStorage } from '../../services/GameStorage.ts';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export const LeaderboardScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [data, playerId] = await Promise.all([
      fetchLeaderboard(100),
      GameStorage.getPlayerId(),
    ]);
    setEntries(data);
    setMyPlayerId(playerId);
    if (playerId) {
      const rank = data.findIndex(e => e.player_id === playerId);
      setMyRank(rank >= 0 ? rank + 1 : null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isMe = item.player_id === myPlayerId;
    const rank = index + 1;
    const medal = rank <= 3 ? MEDAL_COLORS[rank - 1] : null;

    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        <View style={styles.rankContainer}>
          {medal ? (
            <Icon name="medal" size={20} color={medal} />
          ) : (
            <LabelButton style={styles.rankText}>{rank}</LabelButton>
          )}
        </View>
        <Text style={[styles.nicknameText, isMe && styles.nicknameMe]} numberOfLines={1}>
          {item.nickname}{isMe ? ' (sen)' : ''}
        </Text>
        <View style={styles.scoreContainer}>
          <LabelButton style={[styles.scoreText, isMe && styles.scoreMe]}>
            {item.total_score.toLocaleString()}
          </LabelButton>
          <LabelButton style={styles.levelsText}>
            {t('leaderboard.levels', { count: Number(item.levels_completed) })}
          </LabelButton>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <LabelButton style={styles.headerTitle}>{t('leaderboard.title')}</LabelButton>
        <View style={styles.backButton} />
      </View>

      {myRank !== null && (
        <View style={styles.myRankBanner}>
          <Icon name="person" size={16} color={colors.primary} />
          <LabelButton style={styles.myRankText}>
            {t('leaderboard.yourRank', { rank: myRank })}
          </LabelButton>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LabelButton style={styles.emptyText}>{t('leaderboard.empty')}</LabelButton>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.player_id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxxl + spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.brown.light,
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  myRankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary + '18',
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    borderRadius: spacing.borderRadius.lg,
  },
  myRankText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  loader: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    gap: spacing.md,
  },
  rowMe: {
    backgroundColor: colors.primary + '18',
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  nicknameText: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
  },
  nicknameMe: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  scoreContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  scoreText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  scoreMe: {
    color: colors.primary,
  },
  levelsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.brown.light,
    opacity: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
});
